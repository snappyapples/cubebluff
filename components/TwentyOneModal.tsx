'use client'

import ThreeDDice from './ThreeDDice'

interface TwentyOneModalProps {
  isOpen: boolean
  claimerName: string
  onDoubleStakes: () => void
  onPass: () => void
  isLoading: boolean
}

export default function TwentyOneModal({
  isOpen,
  claimerName,
  onDoubleStakes,
  onPass,
  isLoading,
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

        {/* Instructions */}
        <p className="text-center text-gray-400 text-sm mb-6">
          What will you do?
        </p>

        {/* Choices */}
        <div className="space-y-3">
          <button
            onClick={onDoubleStakes}
            disabled={isLoading}
            className="w-full py-4 bg-token-gold hover:bg-yellow-500 text-black font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <span className="text-lg">Accept Challenge</span>
            <p className="text-sm opacity-80">Double stakes - 2 tokens at risk</p>
          </button>

          <button
            onClick={onPass}
            disabled={isLoading}
            className="w-full py-4 bg-panel-bg hover:bg-card-bg text-white font-medium rounded-xl border border-gray-600 transition-all disabled:opacity-50"
          >
            <span className="text-lg">Pass</span>
            <p className="text-sm text-gray-400">Pay 1 token, pass to next player</p>
          </button>
        </div>

        {isLoading && (
          <p className="text-center text-gray-400 text-sm mt-4">
            Processing...
          </p>
        )}
      </div>
    </div>
  )
}
