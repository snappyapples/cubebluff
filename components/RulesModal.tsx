'use client'

interface RulesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-game-bg rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto animate-slide-in shadow-2xl border border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">How to Play</h2>

        {/* Dice Format */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-brand-blue mb-2">The Dice</h3>
          <p className="text-gray-300 text-sm">
            Roll 2 dice secretly. Arrange them into a two-digit number with the higher die first.
          </p>
          <div className="mt-2 bg-panel-bg rounded-lg p-3 text-sm">
            <p className="text-gray-400">Examples:</p>
            <p className="text-white">5 & 3 = <span className="text-brand-blue font-bold">53</span></p>
            <p className="text-white">4 & 4 = <span className="text-token-gold font-bold">44</span> (double!)</p>
            <p className="text-white">2 & 1 = <span className="text-truth-green font-bold">21</span> (highest!)</p>
          </div>
        </section>

        {/* Ranking */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-brand-blue mb-2">Roll Rankings</h3>
          <p className="text-gray-300 text-sm mb-2">
            From highest to lowest:
          </p>
          <ol className="text-sm space-y-1">
            <li className="text-truth-green">1. <span className="font-bold">21</span> - Special highest roll!</li>
            <li className="text-token-gold">2-7. Doubles: 66, 55, 44, 33, 22, 11</li>
            <li className="text-gray-300">8-21. Non-doubles: 65 → 31 (lowest)</li>
          </ol>
        </section>

        {/* Gameplay */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-brand-blue mb-2">Gameplay</h3>
          <ol className="text-sm space-y-2 text-gray-300">
            <li><span className="text-white font-medium">1.</span> Roll your dice secretly</li>
            <li><span className="text-white font-medium">2.</span> Claim a roll (can be truth or a lie!)</li>
            <li><span className="text-white font-medium">3.</span> Your claim must be ≥ the previous claim</li>
            <li><span className="text-white font-medium">4.</span> Next player chooses:
              <ul className="ml-4 mt-1 space-y-1">
                <li>• <span className="text-brand-blue">Roll to beat</span> - Accept and continue</li>
                <li>• <span className="text-bluff-red">Call bluff</span> - Challenge the claim!</li>
              </ul>
            </li>
          </ol>
        </section>

        {/* Bluff Resolution */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-brand-blue mb-2">Calling Bluff</h3>
          <div className="text-sm space-y-2">
            <p className="text-gray-300">When you call bluff, the previous roll is revealed:</p>
            <div className="bg-panel-bg rounded-lg p-3 space-y-2">
              <p className="text-bluff-red">
                <span className="font-medium">Claimer was lying:</span> They lose a token
              </p>
              <p className="text-truth-green">
                <span className="font-medium">Claimer was truthful:</span> You lose a token
              </p>
            </div>
          </div>
        </section>

        {/* Twenty-One Special */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-brand-blue mb-2">Rolling 21</h3>
          <p className="text-gray-300 text-sm mb-2">
            If you actually roll 21, you must choose:
          </p>
          <div className="bg-panel-bg rounded-lg p-3 text-sm space-y-2">
            <p className="text-token-gold">
              <span className="font-bold">"Twenty-one!"</span> - Double stakes (2 tokens at risk)
            </p>
            <p className="text-gray-300">
              <span className="font-bold">"Pass"</span> - Pay 1 token to skip this round safely
            </p>
          </div>
        </section>

        {/* Winning */}
        <section className="mb-4">
          <h3 className="text-lg font-semibold text-brand-blue mb-2">Winning</h3>
          <p className="text-gray-300 text-sm">
            Players are eliminated when they run out of tokens.
            <span className="text-white font-medium"> Last player standing wins!</span>
          </p>
        </section>

        <button
          onClick={onClose}
          className="w-full btn-primary mt-4"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}
