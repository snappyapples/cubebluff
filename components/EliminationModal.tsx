'use client'

import { Player, Resolution } from '@/lib/types'

interface EliminationModalProps {
  isOpen: boolean
  resolution: Resolution | null
  players: Player[]
  myPlayerId: string | null
}

export default function EliminationModal({
  isOpen,
  resolution,
  players,
  myPlayerId,
}: EliminationModalProps) {
  if (!isOpen || !resolution) return null

  const eliminatedPlayer = players.find((p) => p.id === resolution.loserId)
  if (!eliminatedPlayer) return null

  const isMe = resolution.loserId === myPlayerId
  const playerName = isMe ? 'You' : eliminatedPlayer.name
  const verb = isMe ? 'are' : 'is'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      {/* Content */}
      <div className="relative text-center animate-bounce-in">
        {/* Big emoji */}
        <div className="text-8xl mb-6">💀</div>

        {/* OUT! text */}
        <h2 className="text-6xl font-bold text-bluff-red mb-4 animate-pulse">
          OUT!
        </h2>

        {/* Player name */}
        <p className="text-3xl text-white font-semibold mb-2">
          {playerName} {verb} eliminated!
        </p>

        {/* Round info */}
        {eliminatedPlayer.eliminatedRound && (
          <p className="text-gray-400 text-lg">
            Round {eliminatedPlayer.eliminatedRound}
          </p>
        )}

        {/* Tokens lost indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-token-gold/30 animate-token-fall"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <p className="text-gray-500 text-sm mt-6">
          Continuing in a moment...
        </p>
      </div>
    </div>
  )
}
