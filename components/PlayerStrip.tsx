'use client'

import { Player } from '@/lib/types'

interface PlayerStripProps {
  players: Player[]
  currentTurnPlayerId: string
  myPlayerId: string
}

export default function PlayerStrip({ players, currentTurnPlayerId, myPlayerId }: PlayerStripProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
      {players.map((player) => {
        const isCurrentTurn = player.id === currentTurnPlayerId
        const isMe = player.id === myPlayerId

        return (
          <div
            key={player.id}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-full transition-all
              ${player.isEliminated ? 'opacity-40' : ''}
              ${isCurrentTurn ? 'bg-brand-blue/30 ring-2 ring-brand-blue' : 'bg-gray-800'}
            `}
          >
            {/* Current turn indicator */}
            {isCurrentTurn && !player.isEliminated && (
              <span className="text-brand-blue">●</span>
            )}

            {/* Name */}
            <span className={`text-sm font-medium ${
              isMe ? 'text-brand-blue' : 'text-white'
            }`}>
              {player.name}
              {isMe && <span className="text-gray-500 ml-1">(you)</span>}
            </span>

            {/* Tokens */}
            <div className="flex gap-0.5">
              {player.tokens > 0 ? (
                Array.from({ length: player.tokens }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-token-gold"
                  />
                ))
              ) : (
                <span className="text-xs text-bluff-red font-medium">OUT</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
