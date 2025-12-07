'use client'

import { Roll, isTwentyOne, isDouble } from '@/lib/types'
import ThreeDDice from './ThreeDDice'

interface PrivateRollViewProps {
  roll: Roll | null
  isRolling: boolean
  size?: number
}

export default function PrivateRollView({ roll, isRolling, size = 80 }: PrivateRollViewProps) {
  if (!roll && !isRolling) {
    return (
      <div className="game-panel">
        <p className="text-gray-400 text-sm text-center mb-3">Your Roll</p>
        <div className="flex justify-center gap-4">
          <div className="w-20 h-20 bg-panel-bg rounded-xl flex items-center justify-center">
            <span className="text-gray-500 text-2xl">?</span>
          </div>
          <div className="w-20 h-20 bg-panel-bg rounded-xl flex items-center justify-center">
            <span className="text-gray-500 text-2xl">?</span>
          </div>
        </div>
      </div>
    )
  }

  const is21 = roll ? isTwentyOne(roll) : false
  const isDoubleClaim = roll ? isDouble(roll) : false

  return (
    <div className="game-panel">
      <p className="text-gray-400 text-sm text-center mb-3">
        Your Roll (secret)
      </p>

      {/* 3D Dice */}
      <div className="flex justify-center gap-4 mb-3">
        <ThreeDDice
          value={roll?.die1 || 1}
          isRolling={isRolling}
          size={size}
          delay={0}
        />
        <ThreeDDice
          value={roll?.die2 || 1}
          isRolling={isRolling}
          size={size}
          delay={100}
        />
      </div>

      {/* Combined Value */}
      {roll && !isRolling && (
        <div className="text-center">
          <span className="text-2xl font-bold text-gray-400">= </span>
          <span className={`text-3xl font-bold ${
            is21 ? 'text-truth-green' : isDoubleClaim ? 'text-token-gold' : 'text-white'
          }`}>
            {roll.display}
          </span>

          {is21 && (
            <div className="mt-2 text-truth-green text-sm font-medium animate-bounce-in">
              ⭐ TWENTY-ONE! ⭐
            </div>
          )}

          {isDoubleClaim && !is21 && (
            <div className="mt-2 text-token-gold text-sm">
              Double!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
