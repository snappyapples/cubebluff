'use client'

import ThreeDDice from './ThreeDDice'

interface TwentyOneModalProps {
  isOpen: boolean
  claimerName: string
  onDismiss: () => void
}

export default function TwentyOneModal({
  isOpen,
  claimerName,
  onDismiss,
}: TwentyOneModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - no click to close */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-game-bg rounded-2xl p-8 w-full max-w-md animate-bounce-in shadow-2xl border border-truth-green glow-gold">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎰</div>
          <h2 className="text-3xl font-bold text-truth-green mb-2">
            TWENTY-ONE!
          </h2>
          <p className="text-gray-300">
            <span className="font-bold text-white">{claimerName}</span> claims the highest roll!
          </p>
        </div>

        {/* Dice Display */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <ThreeDDice value={2} isRolling={false} size={60} />
          <ThreeDDice value={1} isRolling={false} size={60} />
          <div className="text-center">
            <span className="text-xl font-bold text-gray-400">= </span>
            <span className="text-2xl font-bold text-truth-green">21</span>
            <span className="ml-2 text-truth-green">★</span>
          </div>
        </div>

        {/* Educational content */}
        <div className="bg-panel-bg rounded-xl p-4 mb-6 text-sm">
          <p className="text-token-gold font-semibold mb-2">Double Stakes!</p>
          <p className="text-gray-300 mb-2">
            21 is the highest possible roll. When someone claims 21, the stakes are doubled -
            <span className="text-bluff-red font-semibold"> 2 tokens at risk</span>.
          </p>
          <p className="text-gray-400">
            You can <span className="text-white">Roll to Beat</span>, <span className="text-bluff-red">Call Bluff</span>,
            or <span className="text-gray-300">Pass</span> (costs 1 token).
          </p>
        </div>

        {/* I Understand button */}
        <button
          onClick={onDismiss}
          className="w-full py-4 bg-token-gold hover:bg-yellow-500 text-black font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          I Understand
        </button>
      </div>
    </div>
  )
}
