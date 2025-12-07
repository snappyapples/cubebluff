import { NextRequest, NextResponse } from 'next/server'
import { gameStore } from '@/lib/gameStore'
import { checkAutoTransitions } from '@/lib/gameLogic'

/**
 * GET /api/rooms/[roomId] - Get room state
 * Also handles auto-transitions based on timestamps
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params

    const { room, gameState, playerMapping } = await gameStore.getRoom(roomId)

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    if (!gameState) {
      return NextResponse.json(
        { error: 'Invalid room state' },
        { status: 500 }
      )
    }

    // Check for auto-transitions (phase changes based on time)
    const updatedState = checkAutoTransitions(gameState)

    // If state changed, update the database
    if (updatedState.phase !== gameState.phase) {
      await gameStore.updateGameState(roomId, updatedState)
    }

    // Create a sanitized state for the client (remove server-only data)
    // currentRoll is only sent to the current roller via roll endpoint
    const clientState = {
      ...updatedState,
      currentRoll: null, // Never send actual roll in GET - it's private
    }

    return NextResponse.json({
      success: true,
      gameState: clientState,
      settings: room.settings,
      hostPlayerId: room.host_id,
      playerCount: gameState.players.length,
      started: gameState.phase !== 'lobby',
    })
  } catch (error) {
    console.error('Error getting room:', error)
    return NextResponse.json(
      { error: 'Failed to get room' },
      { status: 500 }
    )
  }
}
