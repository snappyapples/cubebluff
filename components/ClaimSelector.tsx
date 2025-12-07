'use client'

import { useState, useEffect } from 'react'
import { Roll, getValidClaims, isTwentyOne, rollBeatsMinimum } from '@/lib/types'

interface ClaimSelectorProps {
  minimumClaim: Roll | null
  myRoll: Roll | null
  previousClaim: Roll | null      // The claim to beat
  previousClaimerName?: string    // Who made that claim
  onSelect: (claim: Roll) => void
  isLoading: boolean
}

export default function ClaimSelector({
  minimumClaim,
  myRoll,
  previousClaim,
  previousClaimerName,
  onSelect,
  isLoading,
}: ClaimSelectorProps) {
  const [selectedClaim, setSelectedClaim] = useState<Roll | null>(null)

  const validClaims = getValidClaims(minimumClaim)

  // Auto-select the player's actual roll if it's viable
  useEffect(() => {
    if (myRoll) {
      const isViable = !minimumClaim || rollBeatsMinimum(myRoll, minimumClaim)
      if (isViable) {
        setSelectedClaim(myRoll)
      }
    }
  }, [myRoll?.display, minimumClaim?.display])

  const handleConfirm = () => {
    if (selectedClaim && !isLoading) {
      onSelect(selectedClaim)
    }
  }

  return (
    <div className="space-y-3">
      {/* 3-column grid */}
      <div className="max-h-[350px] overflow-y-auto pr-1">
        <div className="grid grid-cols-3 gap-2">
          {validClaims.map((claim) => {
            const is21 = isTwentyOne(claim)
            const isSelected = selectedClaim?.display === claim.display
            const isMyRoll = myRoll?.display === claim.display
            const isPreviousClaim = previousClaim?.display === claim.display

            return (
              <button
                key={claim.display}
                onClick={() => setSelectedClaim(claim)}
                disabled={isLoading}
                className={`
                  flex flex-col items-center justify-center px-2 py-2.5 rounded-lg transition-all
                  ${isSelected
                    ? 'bg-brand-blue text-white ring-2 ring-brand-blue ring-offset-2 ring-offset-gray-900'
                    : isPreviousClaim
                      ? 'bg-bluff-red/20 border border-bluff-red/50 text-gray-200'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                  }
                  ${is21 ? 'border-2 border-truth-green' : ''}
                `}
              >
                <span className={`text-lg font-bold font-mono ${
                  is21 ? 'text-truth-green' : ''
                }`}>
                  {claim.display}
                </span>

                {/* Labels below the number */}
                <div className="flex gap-1 mt-1">
                  {is21 && (
                    <span className="text-[10px] bg-truth-green/20 text-truth-green px-1.5 py-0.5 rounded">BEST</span>
                  )}
                  {isMyRoll && (
                    <span className="text-[10px] bg-brand-blue/30 text-brand-blue-light px-1.5 py-0.5 rounded">YOU</span>
                  )}
                  {isPreviousClaim && (
                    <span className="text-[10px] bg-bluff-red/30 text-red-300 px-1.5 py-0.5 rounded">BEAT</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Confirm button - shows when claim is selected */}
      {selectedClaim && (
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className="w-full py-3 bg-truth-green hover:bg-truth-green/90 text-white font-bold rounded-lg transition-all animate-fade-in"
        >
          {isLoading ? 'Claiming...' : `Claim ${selectedClaim.display}!`}
        </button>
      )}

      {/* Minimum claim indicator at bottom */}
      {minimumClaim && (
        <p className="text-xs text-gray-500 text-center">
          Must beat {minimumClaim.display}
        </p>
      )}
    </div>
  )
}
