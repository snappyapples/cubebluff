'use client'

import { useState, useEffect } from 'react'
import { Roll, ROLL_RANKINGS, ClaimHistoryEntry, isTwentyOne, isDouble, rollBeatsMinimum, createRoll } from '@/lib/types'

interface ClaimListProps {
  currentClaim: Roll | null        // The claim that was just made (to beat)
  previousClaimerName?: string     // Who made that claim
  myRoll: Roll | null              // My secret roll (if I have one)
  minimumClaim: Roll | null        // What I need to beat
  canSelectClaim: boolean          // Is it my turn to make a claim?
  onClaim?: (claim: Roll) => void  // Callback when I make a claim
  isLoading?: boolean
  claimHistory?: ClaimHistoryEntry[]  // All claims made this round
}

export default function ClaimList({
  currentClaim,
  previousClaimerName,
  myRoll,
  minimumClaim,
  canSelectClaim,
  onClaim,
  isLoading = false,
  claimHistory = [],
}: ClaimListProps) {
  const [selectedClaim, setSelectedClaim] = useState<Roll | null>(null)

  // Auto-select my roll if it's viable when I can claim
  useEffect(() => {
    if (canSelectClaim && myRoll) {
      const isViable = !minimumClaim || rollBeatsMinimum(myRoll, minimumClaim)
      if (isViable) {
        setSelectedClaim(myRoll)
      }
    } else if (!canSelectClaim) {
      setSelectedClaim(null)
    }
  }, [canSelectClaim, myRoll?.display, minimumClaim?.display])

  const handleConfirm = () => {
    if (selectedClaim && onClaim && !isLoading) {
      onClaim(selectedClaim)
    }
  }

  // Build all rolls from ranking
  const allRolls: Roll[] = ROLL_RANKINGS.map((display, index) => {
    const die1 = parseInt(display[0])
    const die2 = parseInt(display[1])
    return createRoll(die1, die2)
  })

  return (
    <div className="flex-1 overflow-y-auto pr-1 space-y-3">
      {/* 3-column grid */}
      <div className="grid grid-cols-3 gap-2">
        {allRolls.map((roll) => {
          const is21 = isTwentyOne(roll)
          const isDoubleRoll = isDouble(roll)
          const isCurrentClaim = currentClaim?.display === roll.display
          const isMyRoll = myRoll?.display === roll.display
          const isSelected = selectedClaim?.display === roll.display

          // Find all players who claimed this value in history
          const claimers = claimHistory.filter(entry => entry.claim.display === roll.display)
          const wasClaimed = claimers.length > 0

          // Can this be claimed? (must beat minimum)
          const canClaim = canSelectClaim && (!minimumClaim || rollBeatsMinimum(roll, minimumClaim))
          const isBelowMinimum = minimumClaim && !rollBeatsMinimum(roll, minimumClaim)

          return (
            <div key={roll.display} className="relative">
              <button
                onClick={() => canClaim && setSelectedClaim(roll)}
                disabled={isLoading || !canClaim}
                className={`
                  w-full min-h-[60px] flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all
                  ${isSelected
                    ? 'bg-brand-blue text-white ring-2 ring-brand-blue ring-offset-2 ring-offset-gray-900'
                    : isCurrentClaim
                      ? 'bg-brand-blue/40 border-2 border-brand-blue text-white'
                      : wasClaimed
                        ? 'bg-gray-800/50 text-gray-300'
                        : isBelowMinimum
                          ? 'bg-gray-900/30 text-gray-600'
                          : 'bg-gray-700 text-white'
                  }
                  ${canClaim && !isSelected ? 'hover:bg-gray-600 cursor-pointer' : ''}
                  ${!canClaim && !isCurrentClaim ? 'cursor-default opacity-60' : ''}
                  ${is21 ? 'border-2 border-truth-green' : isDoubleRoll ? 'border-2 border-token-gold' : ''}
                `}
              >
                <span className={`text-lg font-bold font-mono ${
                  is21 ? 'text-truth-green' : isDoubleRoll ? 'text-token-gold' : ''
                } ${isBelowMinimum ? 'text-gray-600' : ''}`}>
                  {roll.display}
                </span>

                {/* Labels below the number - fixed height for consistent sizing */}
                <div className="flex flex-wrap justify-center gap-1 mt-1 h-5">
                  {isMyRoll && (
                    <span className="text-[10px] bg-brand-blue/30 text-brand-blue-light px-1.5 py-0.5 rounded">YOU</span>
                  )}
                  {/* Show claimers from history (just first name to fit) */}
                  {claimers.slice(0, 2).map((entry, idx) => (
                    <span
                      key={`${entry.playerId}-${idx}`}
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate max-w-[60px] ${
                        isCurrentClaim && idx === claimers.length - 1
                          ? 'bg-brand-blue/70 text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {entry.playerName.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </button>

              {/* Overlay Claim button when selected */}
              {isSelected && canSelectClaim && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleConfirm()
                  }}
                  disabled={isLoading}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-truth-green hover:bg-truth-green/90 text-white font-bold rounded-lg transition-all animate-fade-in"
                >
                  {isLoading ? '...' : `Claim ${roll.display}!`}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
