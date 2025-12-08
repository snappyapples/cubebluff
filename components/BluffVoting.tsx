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
  votes: { [playerId: string]: 'bluff' | 'truth' }
  voteToasts: VoteToast[]
  onVote: (vote: 'bluff' | 'truth') => void
  canVote: boolean
}

export default function BluffVoting({
  players,
  myPlayerId,
  currentTurnPlayerId,
  previousClaimerId,
  votes,
  voteToasts,
  onVote,
  canVote
}: BluffVotingProps) {
  const myVote = myPlayerId ? votes[myPlayerId] : null

  // Can this player vote? Not the claimer, not the responder (current turn), and not eliminated
  const myPlayer = players.find(p => p.id === myPlayerId)
  const isEligible = canVote &&
    myPlayerId !== previousClaimerId &&
    myPlayerId !== currentTurnPlayerId &&
    myPlayer && !myPlayer.isEliminated

  return (
    <>
      {/* Reaction buttons - compact and non-intrusive */}
      {isEligible && (
        <div className="flex justify-center gap-2 mb-3">
          <button
            onClick={() => onVote('bluff')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              myVote === 'bluff'
                ? 'bg-bluff-red text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-bluff-red/30 border border-gray-700'
            }`}
          >
            🎭 Bluff
          </button>
          <button
            onClick={() => onVote('truth')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              myVote === 'truth'
                ? 'bg-truth-green text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-truth-green/30 border border-gray-700'
            }`}
          >
            ✓ Truth
          </button>
        </div>
      )}

      {/* Toast notifications at bottom */}
      <div className="fixed bottom-16 left-0 right-0 pointer-events-none z-40 flex flex-col items-center gap-2 px-4">
        {voteToasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-fade-in-up ${
              toast.vote === 'bluff'
                ? 'bg-bluff-red/90 text-white'
                : 'bg-truth-green/90 text-white'
            }`}
          >
            {toast.playerName} thinks {toast.vote === 'bluff' ? 'BLUFF' : 'TRUTH'}
          </div>
        ))}
      </div>
    </>
  )
}
