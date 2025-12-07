'use client'

import { Player } from '@/lib/types'
import { useRouter } from 'next/navigation'

interface GameOverScreenProps {
  winner: Player | null
  players: Player[]
  onPlayAgain: () => void
  isOpen: boolean
}

export default function GameOverScreen({
  winner,
  players,
  onPlayAgain,
  isOpen,
}: GameOverScreenProps) {
  const router = useRouter()

  if (!isOpen) return null

  // Sort players: winner first, then by elimination round (later = better), then by tokens
  const standings = [...players].sort((a, b) => {
    if (!a.isEliminated && b.isEliminated) return -1
    if (a.isEliminated && !b.isEliminated) return 1
    if (a.isEliminated && b.isEliminated) {
      return (b.eliminatedRound || 0) - (a.eliminatedRound || 0)
    }
    return b.tokens - a.tokens
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      {/* Content */}
      <div className="relative w-full max-w-md animate-slide-in">
        {/* Winner Celebration */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-4xl font-bold text-token-gold mb-2">
            WINNER!
          </h2>
          <p className="text-3xl font-bold text-white">
            {winner?.name || 'Unknown'}
          </p>
          {winner && (
            <p className="text-gray-400 mt-2">
              with {winner.tokens} token{winner.tokens !== 1 ? 's' : ''} remaining
            </p>
          )}
        </div>

        {/* Standings */}
        <div className="bg-game-bg rounded-2xl p-4 mb-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-300 mb-3 text-center">
            Final Standings
          </h3>
          <div className="space-y-2">
            {standings.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  index === 0 ? 'bg-token-gold/20' : 'bg-panel-bg'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${
                    index === 0 ? 'text-token-gold' : 'text-gray-400'
                  }`}>
                    {index + 1}.
                  </span>
                  <span className="text-white font-medium">
                    {player.name}
                  </span>
                </div>
                <div className="text-sm">
                  {player.isEliminated ? (
                    <span className="text-bluff-red">
                      Out R{player.eliminatedRound}
                    </span>
                  ) : (
                    <span className="text-token-gold">
                      {player.tokens} tokens
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full btn-primary text-lg py-4"
          >
            Play Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full btn-secondary text-lg py-4"
          >
            New Room
          </button>
        </div>
      </div>
    </div>
  )
}
