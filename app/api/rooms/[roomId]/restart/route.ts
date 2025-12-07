import { NextRequest, NextResponse } from 'next/server'
import { gameStore } from '@/lib/gameStore'

/**
 * POST /api/rooms/[roomId]/restart - Restart the game in the same room
 * First player to click becomes the new host
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params
    const body = await request.json()
    const { playerId, nickname } = body

    if (!playerId || !nickname) {
      return NextResponse.json(
        { error: 'Missing playerId or nickname' },
        { status: 400 }
      )
    }

    const result = await gameStore.restartRoom(roomId, playerId, nickname)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error restarting room:', error)
    return NextResponse.json(
      { error: 'Failed to restart room' },
      { status: 500 }
    )
  }
}
