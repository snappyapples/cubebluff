'use client'

import { Player } from '@/lib/types'

interface BluffVotingProps {
  players: Player[]
  myPlayerId: string | null
  previousClaimerId: string | null
  votes: { [playerId: string]: 'bluff' | 'truth' }
  onVote: (vote: 'bluff' | 'truth' | null) => void
  disabled: boolean
}

export default function BluffVoting({
  players,
  myPlayerId,
  previousClaimerId,
  votes,
  onVote,
  disabled
}: BluffVotingProps) {
  // Players who can vote (everyone except claimer and eliminated players)
  const eligibleVoters = players.filter(
    p => !p.isEliminated && p.id !== previousClaimerId
  )

  const bluffVoters = eligibleVoters.filter(p => votes[p.id] === 'bluff')
  const truthVoters = eligibleVoters.filter(p => votes[p.id] === 'truth')
  const undecidedVoters = eligibleVoters.filter(p => !votes[p.id])

  const myVote = myPlayerId ? votes[myPlayerId] : null
  const canVote = myPlayerId && myPlayerId !== previousClaimerId && !disabled

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <div className="game-card mb-3">
      <h4 className="text-xs text-gray-400 text-center mb-3 font-medium">
        What do you think?
      </h4>

      <div className="flex justify-between items-start gap-2">
        {/* Bluff side */}
        <div className="flex-1">
          <button
            onClick={() => canVote && onVote(myVote === 'bluff' ? null : 'bluff')}
            disabled={!canVote}
            className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${
              myVote === 'bluff'
                ? 'bg-bluff-red text-white shadow-glow-red'
                : 'bg-gray-700/50 text-gray-300 hover:bg-bluff-red/30 border border-gray-600'
            } ${!canVote ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Bluff
          </button>
          {/* Avatar row for bluff voters */}
          <div className="flex flex-wrap justify-center gap-1 mt-2 min-h-[28px]">
            {bluffVoters.map(p => (
              <div
                key={p.id}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${p.id === myPlayerId
                    ? 'bg-bluff-red text-white ring-2 ring-white/50'
                    : 'bg-bluff-red/40 text-bluff-red border border-bluff-red/50'
                  }`}
                title={p.name}
              >
                {getInitials(p.name)}
              </div>
            ))}
          </div>
        </div>

        {/* Undecided in middle */}
        <div className="flex flex-col items-center px-2">
          <span className="text-xs text-gray-500 mb-1">?</span>
          <div className="flex flex-wrap justify-center gap-1 min-h-[28px]">
            {undecidedVoters.map(p => (
              <div
                key={p.id}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium
                  ${p.id === myPlayerId
                    ? 'bg-gray-600 text-white ring-2 ring-white/30'
                    : 'bg-gray-700/50 text-gray-400 border border-gray-600'
                  }`}
                title={p.name}
              >
                {getInitials(p.name)}
              </div>
            ))}
          </div>
        </div>

        {/* Truth side */}
        <div className="flex-1">
          <button
            onClick={() => canVote && onVote(myVote === 'truth' ? null : 'truth')}
            disabled={!canVote}
            className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${
              myVote === 'truth'
                ? 'bg-truth-green text-white shadow-glow-blue'
                : 'bg-gray-700/50 text-gray-300 hover:bg-truth-green/30 border border-gray-600'
            } ${!canVote ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Truth
          </button>
          {/* Avatar row for truth voters */}
          <div className="flex flex-wrap justify-center gap-1 mt-2 min-h-[28px]">
            {truthVoters.map(p => (
              <div
                key={p.id}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${p.id === myPlayerId
                    ? 'bg-truth-green text-white ring-2 ring-white/50'
                    : 'bg-truth-green/40 text-truth-green border border-truth-green/50'
                  }`}
                title={p.name}
              >
                {getInitials(p.name)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vote count summary */}
      <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
        <span>
          <span className="text-bluff-red font-semibold">{bluffVoters.length}</span> think bluff
        </span>
        <span>
          <span className="text-truth-green font-semibold">{truthVoters.length}</span> think truth
        </span>
      </div>
    </div>
  )
}
