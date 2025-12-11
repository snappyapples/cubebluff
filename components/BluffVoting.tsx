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
  // Can this player vote? Not the claimer, not the responder (current turn)
  // Eliminated players CAN still vote as spectators
  const myPlayer = players.find(p => p.id === myPlayerId)
  const claimer = players.find(p => p.id === previousClaimerId)
  const isEligible = canVote &&
    myPlayerId !== previousClaimerId &&
    myPlayerId !== currentTurnPlayerId &&
    myPlayer

  return (
    <>
      {/* Inline voting buttons - same style as action panel */}
      {isEligible && (
        <div className="mb-3">
          <p className="text-center text-xs text-gray-400 mb-2">{claimer?.name}'s claim?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onVote('truth')}
              className="py-2.5 rounded-xl font-semibold text-sm bg-truth-green/20 text-truth-green border border-truth-green/50 hover:bg-truth-green/30 active:scale-95 transition-all"
            >
              TRUTH
            </button>
            <button
              onClick={() => onVote('bluff')}
              className="py-2.5 rounded-xl font-semibold text-sm bg-bluff-red/20 text-bluff-red border border-bluff-red/50 hover:bg-bluff-red/30 active:scale-95 transition-all"
            >
              BLUFF
            </button>
          </div>
        </div>
      )}

      {/* Toast notifications - fixed centered overlay */}
      {voteToasts.length > 0 && (
        <div className="fixed top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none z-50 flex flex-col items-center gap-2 px-4">
          {voteToasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-6 py-3 rounded-xl text-lg font-bold shadow-2xl animate-fade-in-up ${
                toast.vote === 'bluff'
                  ? 'bg-bluff-red text-white'
                  : 'bg-truth-green text-white'
              }`}
            >
              {toast.playerName} thinks {toast.vote === 'bluff' ? 'BLUFF' : 'TRUTH'}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
