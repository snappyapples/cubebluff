import { NextRequest, NextResponse } from 'next/server'
import { gameStore } from '@/lib/gameStore'
import { callBluff } from '@/lib/gameLogic'

/**
 * POST /api/rooms/[roomId]/bluff - Call bluff on the previous player
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

    if (gameState.phase !== 'awaiting_response') {
      return NextResponse.json(
        { error: 'Cannot call bluff in this phase' },
        { status: 400 }
      )
    }

    // Get the actual roll from the game state (we already have it)
    const actualRoll = gameState.currentRoll

    console.log('Bluff called - actualRoll:', actualRoll)

    if (!actualRoll) {
      return NextResponse.json(
        { error: 'No roll to reveal' },
        { status: 400 }
      )
    }

    // Process bluff call
    const newState = callBluff(gameState, gamePlayerId, actualRoll)

    // Save state
    await gameStore.updateGameState(roomId, newState)

    // Return state with the revealed roll (everyone can now see it)
    return NextResponse.json({
      success: true,
      gameState: newState,
      revealedRoll: actualRoll,
    })
  } catch (error) {
    console.error('Error calling bluff:', error)
    return NextResponse.json(
      { error: 'Failed to call bluff' },
      { status: 500 }
    )
  }
}
