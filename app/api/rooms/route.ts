import { NextRequest, NextResponse } from 'next/server'
import { gameStore } from '@/lib/gameStore'

/**
 * POST /api/rooms - Create a new room
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerId, nickname, startingTokens = 5 } = body

    if (!playerId || !nickname) {
      return NextResponse.json(
        { error: 'Missing playerId or nickname' },
        { status: 400 }
      )
    }

    // Validate starting tokens
    const validTokens = [3, 5, 7, 10]
    const tokens = validTokens.includes(startingTokens) ? startingTokens : 5

    const roomCode = await gameStore.createRoom(playerId, nickname, tokens)

    return NextResponse.json({
      success: true,
      roomCode,
    })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
