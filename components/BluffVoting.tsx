'use client'

import { Player } from '@/lib/types'

interface VoteToast {
  id: string
  playerName: string
  vote: 'bluff' | 'truth'
  timestamp: number
}

interface BluffVotingProps {
  players: Player[]
  myPlayerId: string | null
  currentTurnPlayerId: string | null
  previousClaimerId: string | null
  voteToasts: VoteToast[]
  onVote: (vote: 'bluff' | 'truth') => void
  canVote: boolean
}

export default function BluffVoting({
  players,
  myPlayerId,
  currentTurnPlayerId,
  previousClaimerId,
  voteToasts,
  onVote,
  canVote
}: BluffVotingProps) {
  // Can this player vote? Not the claimer, not the responder (current turn), and not eliminated
  const myPlayer = players.find(p => p.id === myPlayerId)
  const claimer = players.find(p => p.id === previousClaimerId)
  const isEligible = canVote &&
    myPlayerId !== previousClaimerId &&
    myPlayerId !== currentTurnPlayerId &&
    myPlayer && !myPlayer.isEliminated

  return (
    <>
      {/* Fixed corner buttons - only for eligible voters */}
      {isEligible && (
        <>
          {/* Label centered above buttons */}
          <div className="fixed bottom-28 left-0 right-0 z-40 text-center pointer-events-none">
            <span className="text-xs text-gray-400">{claimer?.name || 'Their'} claim?</span>
          </div>

          {/* Bottom left - Truth button */}
          <button
            onClick={() => onVote('truth')}
            className="fixed bottom-20 left-4 z-40 px-4 py-2 rounded-full text-sm font-bold bg-truth-green/80 text-white shadow-lg hover:bg-truth-green active:scale-95 transition-all"
          >
            TRUTH
          </button>

          {/* Bottom right - Bluff button */}
          <button
            onClick={() => onVote('bluff')}
            className="fixed bottom-20 right-4 z-40 px-4 py-2 rounded-full text-sm font-bold bg-bluff-red/80 text-white shadow-lg hover:bg-bluff-red active:scale-95 transition-all"
          >
            BLUFF
          </button>
        </>
      )}

      {/* Toast notifications - centered overlay */}
      <div className="fixed bottom-36 left-0 right-0 pointer-events-none z-50 flex flex-col items-center gap-2 px-4">
        {voteToasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-5 py-2.5 rounded-full text-base font-semibold shadow-xl animate-fade-in-up ${
              toast.vote === 'bluff'
                ? 'bg-bluff-red text-white'
                : 'bg-truth-green text-white'
            }`}
          >
            {toast.playerName} thinks {toast.vote === 'bluff' ? 'BLUFF' : 'TRUTH'}
          </div>
        ))}
      </div>
    </>
  )
}
