import { NextRequest, NextResponse } from 'next/server'
import { gameStore } from '@/lib/gameStore'

/**
 * POST /api/rooms/[roomId]/vote - Submit bluff vote
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params
    const body = await request.json()
    const { playerId, vote } = body // vote: 'bluff' | 'truth' | null (to clear)

    if (!playerId) {
      return NextResponse.json(
        { error: 'Missing playerId' },
        { status: 400 }
      )
    }

    const { room, gameState, playerMapping } = await gameStore.getRoom(roomId)

    if (!room || !gameState || !playerMapping) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Only allow voting during awaiting_response or awaiting_21_choice phases
    if (gameState.phase !== 'awaiting_response' && gameState.phase !== 'awaiting_21_choice') {
      return NextResponse.json(
        { error: 'Cannot vote in this phase' },
        { status: 400 }
      )
    }

    const mapping = playerMapping[playerId]
    if (!mapping) {
      return NextResponse.json(
        { error: 'Player not in room' },
        { status: 400 }
      )
    }

    const gamePlayerId = mapping.playerId

    // Don't allow the claimer to vote on their own claim
    if (gamePlayerId === gameState.previousClaimerId) {
      return NextResponse.json(
        { error: 'Cannot vote on your own claim' },
        { status: 400 }
      )
    }

    // Update votes
    const newVotes = { ...(gameState.bluffVotes || {}) }
    if (vote === null) {
      delete newVotes[gamePlayerId]
    } else {
      newVotes[gamePlayerId] = vote
    }

    const newState = { ...gameState, bluffVotes: newVotes }
    await gameStore.updateGameState(roomId, newState)

    return NextResponse.json({ success: true, votes: newVotes })
  } catch (error) {
    console.error('Error submitting vote:', error)
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}
