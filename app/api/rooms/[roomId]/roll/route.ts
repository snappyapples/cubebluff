import { NextRequest, NextResponse } from 'next/server'
import { gameStore } from '@/lib/gameStore'
import { generateRoll, applyRoll } from '@/lib/gameLogic'

/**
 * POST /api/rooms/[roomId]/roll - Roll dice (first roll of turn)
 * Server generates the roll and stores it
 * Returns the roll ONLY to the rolling player
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params
    const body = await request.json()
    const { playerId } = body

    if (!playerId) {
      return NextResponse.json(
        { error: 'Missing playerId' },
        { status: 400 }
      )
    }

    // Get current state
    const { room, gameState, playerMapping } = await gameStore.getRoom(roomId)

    if (!room || !gameState || !playerMapping) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Get game player ID
    const mapping = playerMapping[playerId]
    if (!mapping) {
      return NextResponse.json(
        { error: 'Player not in room' },
        { status: 400 }
      )
    }

    const gamePlayerId = mapping.playerId

    // Verify it's this player's turn and correct phase
    if (gameState.currentTurnPlayerId !== gamePlayerId) {
      return NextResponse.json(
        { error: 'Not your turn' },
        { status: 400 }
      )
    }

    if (gameState.phase !== 'awaiting_roll') {
      return NextResponse.json(
        { error: 'Cannot roll in this phase' },
        { status: 400 }
      )
    }

    // Generate roll (SERVER-SIDE ONLY!)
    const roll = generateRoll()

    // Apply roll to game state
    const newState = applyRoll(gameState, roll)

    // Save state with roll (stored server-side)
    await gameStore.updateGameState(roomId, newState)

    // Return roll to the player (this is the ONLY time they see it)
    return NextResponse.json({
      success: true,
      roll, // Only the roller sees this
      gameState: {
        ...newState,
        currentRoll: roll, // Include in response for this player only
      },
    })
  } catch (error) {
    console.error('Error rolling:', error)
    return NextResponse.json(
      { error: 'Failed to roll' },
      { status: 500 }
    )
  }
}
