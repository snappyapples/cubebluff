'use client'

import { Roll, Player, isDouble, isTwentyOne } from '@/lib/types'

interface ClaimDisplayProps {
  currentClaim: Roll | null
  claimerName: string
  isDoubleStakes: boolean
  minimumClaim: Roll | null
}

export default function ClaimDisplay({
  currentClaim,
  claimerName,
  isDoubleStakes,
  minimumClaim,
}: ClaimDisplayProps) {
  if (!currentClaim) {
    // No claim yet - show minimum or "First Roll"
    return (
      <div className="game-panel text-center py-6">
        <p className="text-gray-400 text-sm mb-2">
          {minimumClaim ? 'Minimum Claim' : 'First Roll of Round'}
        </p>
        {minimumClaim ? (
          <div className="text-3xl font-bold text-gray-500">
            {minimumClaim.display}+
          </div>
        ) : (
          <div className="text-2xl text-gray-500">
            Any claim allowed
          </div>
        )}
      </div>
    )
  }

  const is21 = isTwentyOne(currentClaim)
  const isDoubleClaim = isDouble(currentClaim)

  return (
    <div className={`game-panel text-center py-6 transition-all ${
      isDoubleStakes ? 'ring-2 ring-token-gold animate-pulse-danger glow-gold' : ''
    }`}>
      <p className="text-gray-400 text-sm mb-2">
        Last Claim
        {isDoubleStakes && (
          <span className="ml-2 text-token-gold font-medium">⚠️ DOUBLE STAKES</span>
        )}
      </p>

      <div className={`text-5xl font-bold mb-2 ${
        is21 ? 'text-truth-green' : isDoubleClaim ? 'text-token-gold' : 'text-brand-blue'
      }`}>
        {currentClaim.display}
      </div>

      <p className="text-gray-300">
        by <span className="font-medium text-white">{claimerName}</span>
      </p>

      {is21 && (
        <div className="mt-2 text-truth-green text-sm font-medium">
          TWENTY-ONE! (Highest possible)
        </div>
      )}

      {isDoubleClaim && !is21 && (
        <div className="mt-2 text-token-gold text-sm">
          Double
        </div>
      )}
    </div>
  )
}
