'use client'

import { Resolution, Player } from '@/lib/types'
import ThreeDDice from './ThreeDDice'

interface BluffResolutionProps {
  resolution: Resolution
  players: Player[]
  isOpen: boolean
  myPlayerId: string | null
  claimerId: string | null // Who made the claim that was challenged
}

export default function BluffResolution({ resolution, players, isOpen, myPlayerId, claimerId }: BluffResolutionProps) {
  if (!isOpen || !resolution) return null

  const loser = players.find((p) => p.id === resolution.loserId)
  const claimer = players.find((p) => p.id === claimerId)
  const wasBluffing = resolution.type === 'bluff_success'

  // Get claimer name for display
  const claimerName = claimerId === myPlayerId ? 'You' : claimer?.name || 'They'
  const wasWere = claimerId === myPlayerId ? 'were' : 'was'

  // Loser text for token loss
  const loserText = loser?.id === myPlayerId ? 'You lose' : `${loser?.name} loses`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-game-bg rounded-2xl p-8 w-full max-w-md animate-slide-in shadow-2xl border border-gray-700">
        {/* Main Result - Top and prominent */}
        <div className={`text-center p-5 rounded-xl mb-6 ${
          wasBluffing ? 'bg-bluff-red/20' : 'bg-truth-green/20'
        }`}>
          {wasBluffing ? (
            <>
              <p className="text-3xl font-bold text-bluff-red mb-2">
                {claimerName} {wasWere} bluffing!
              </p>
              <p className="text-gray-300">
                {loserText} {resolution.tokensLost} token{resolution.tokensLost > 1 ? 's' : ''}
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-truth-green mb-2">
                {claimerName} {wasWere} telling the truth!
              </p>
              <p className="text-gray-300">
                {loserText} {resolution.tokensLost} token{resolution.tokensLost > 1 ? 's' : ''}
              </p>
            </>
          )}
        </div>

        {/* Details: Claim vs Actual */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Claimed</p>
            <div className="text-3xl font-bold text-brand-blue">
              {resolution.claim.display}
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Actual Roll</p>
            <div className="flex justify-center gap-2 mb-1">
              <ThreeDDice value={resolution.actualRoll.die1} isRolling={false} size={40} />
              <ThreeDDice value={resolution.actualRoll.die2} isRolling={false} size={40} />
            </div>
            <div className="text-xl font-bold text-white">
              {resolution.actualRoll.display}
            </div>
          </div>
        </div>

        {/* Token Animation */}
        <div className="flex justify-center mt-4">
          {Array.from({ length: resolution.tokensLost }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full bg-token-gold animate-token-fall mx-0.5"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          Continuing in a moment...
        </p>
      </div>
    </div>
  )
}
