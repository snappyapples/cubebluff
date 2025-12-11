import { NextRequest, NextResponse } from 'next/server'
import { gameStore } from '@/lib/gameStore'
import { handleTwentyOneChoice } from '@/lib/gameLogic'

/**
 * POST /api/rooms/[roomId]/twenty-one - Handle 21 pass choice
 * Player chooses to pass on a 21 claim (pay 1 token, new round starts)
 * Note: Double stakes is now automatic - players roll-to-beat or call bluff directly
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params
    const body = await request.json()
    const { playerId, choice } = body

    if (!playerId || !choice) {
      return NextResponse.json(
        { error: 'Missing playerId or choice' },
        { status: 400 }
      )
    }

    // Only pass is valid now (roll-to-beat and call-bluff have their own endpoints)
    if (choice !== 'pass') {
      return NextResponse.json(
        { error: 'Invalid choice. Must be "pass"' },
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

    // Verify it's this player's turn
    if (gameState.currentTurnPlayerId !== gamePlayerId) {
      return NextResponse.json(
        { error: 'Not your turn' },
        { status: 400 }
      )
    }

    // Verify there's a 21 response pending (either via pendingTwentyOneChoice or is21Response)
    if (!gameState.pendingTwentyOneChoice && !gameState.is21Response) {
      return NextResponse.json(
        { error: 'No 21 response pending' },
        { status: 400 }
      )
    }

    // Process pass choice
    const newState = handleTwentyOneChoice(gameState, gamePlayerId, 'pass')

    // Save state
    await gameStore.updateGameState(roomId, newState)

    return NextResponse.json({
      success: true,
      gameState: { ...newState, currentRoll: null },
    })
  } catch (error) {
    console.error('Error handling 21 choice:', error)
    return NextResponse.json(
      { error: 'Failed to process choice' },
      { status: 500 }
    )
  }
}
