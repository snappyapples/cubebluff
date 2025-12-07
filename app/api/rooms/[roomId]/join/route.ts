import { NextRequest, NextResponse } from 'next/server'
import { gameStore } from '@/lib/gameStore'

/**
 * POST /api/rooms/[roomId]/join - Join a room
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

    // Validate nickname length
    if (nickname.length < 1 || nickname.length > 20) {
      return NextResponse.json(
        { error: 'Nickname must be 1-20 characters' },
        { status: 400 }
      )
    }

    const result = await gameStore.joinRoom(roomId, playerId, nickname)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    )
  }
}
