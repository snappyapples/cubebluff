import { NextRequest, NextResponse } from 'next/server'
import { gameStore } from '@/lib/gameStore'
import { handleTwentyOneChoice } from '@/lib/gameLogic'

/**
 * POST /api/rooms/[roomId]/twenty-one - Handle 21 choice
 * Player chooses to either double stakes or pass
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

    // Validate choice
    if (choice !== 'double_stakes' && choice !== 'pass') {
      return NextResponse.json(
        { error: 'Invalid choice. Must be "double_stakes" or "pass"' },
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

    if (gameState.phase !== 'awaiting_21_choice') {
      return NextResponse.json(
        { error: 'No 21 choice pending' },
        { status: 400 }
      )
    }

    // Process choice
    const newState = handleTwentyOneChoice(gameState, gamePlayerId, choice)

    // Save state
    await gameStore.updateGameState(roomId, newState)

    // If they chose double stakes, include their roll so they can make a claim
    const responseState = choice === 'double_stakes' && gameState.currentRoll
      ? { ...newState, currentRoll: gameState.currentRoll }
      : { ...newState, currentRoll: null }

    return NextResponse.json({
      success: true,
      gameState: responseState,
    })
  } catch (error) {
    console.error('Error handling 21 choice:', error)
    return NextResponse.json(
      { error: 'Failed to process choice' },
      { status: 500 }
    )
  }
}
