import { NextRequest, NextResponse } from 'next/server'
import { gameStore } from '@/lib/gameStore'
import { makeClaim } from '@/lib/gameLogic'
import { createRoll, rollBeatsMinimum } from '@/lib/types'

/**
 * POST /api/rooms/[roomId]/claim - Make a claim
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params
    const body = await request.json()
    const { playerId, claim } = body

    if (!playerId || !claim) {
      return NextResponse.json(
        { error: 'Missing playerId or claim' },
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

    if (gameState.phase !== 'awaiting_claim') {
      return NextResponse.json(
        { error: 'Cannot claim in this phase' },
        { status: 400 }
      )
    }

    // Parse claim into Roll object
    const claimRoll = createRoll(claim.die1, claim.die2)

    // Validate claim is >= minimum
    if (gameState.minimumClaim && !rollBeatsMinimum(claimRoll, gameState.minimumClaim)) {
      return NextResponse.json(
        { error: 'Claim must be higher than or equal to previous claim' },
        { status: 400 }
      )
    }

    // Apply claim
    const newState = makeClaim(gameState, gamePlayerId, claimRoll)

    // Save state
    await gameStore.updateGameState(roomId, newState)

    return NextResponse.json({
      success: true,
      gameState: {
        ...newState,
        currentRoll: null, // Don't expose the actual roll
      },
    })
  } catch (error) {
    console.error('Error making claim:', error)
    return NextResponse.json(
      { error: 'Failed to make claim' },
      { status: 500 }
    )
  }
}
