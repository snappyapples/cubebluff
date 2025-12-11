'use client'

import { GamePhase, Roll, Player, isTwentyOne, isDouble } from '@/lib/types'
import ThreeDDice from './ThreeDDice'

interface ActionPanelProps {
  phase: GamePhase
  isMyTurn: boolean
  currentClaim: Roll | null
  players: Player[]
  currentTurnPlayerId: string
  myPlayerId: string
  myRoll: Roll | null
  isRolling: boolean
  rollId: number // Unique ID for each roll to force animation restart
  onRoll: () => void
  onCallBluff: () => void
  onRollToBeat: () => void
  onPass?: () => void // For 21 response
  isLoading: boolean
  previousClaimerName?: string
  is21Response?: boolean // True when responding to a 21 claim
  isDoubleStakes?: boolean // Show double stakes warning
}

export default function ActionPanel({
  phase,
  isMyTurn,
  currentClaim,
  players,
  currentTurnPlayerId,
  myPlayerId,
  myRoll,
  isRolling,
  rollId,
  onRoll,
  onCallBluff,
  onRollToBeat,
  onPass,
  isLoading,
  previousClaimerName,
  is21Response,
  isDoubleStakes,
}: ActionPanelProps) {
  const currentPlayer = players.find(p => p.id === currentTurnPlayerId)
  const is21 = myRoll ? isTwentyOne(myRoll) : false
  const isDoubleClaim = myRoll ? isDouble(myRoll) : false

  // Determine what to show
  const showDice = isMyTurn && (isRolling || phase === 'awaiting_claim')
  const showRollButton = isMyTurn && phase === 'awaiting_roll' && !isRolling
  const showResponseButtons = isMyTurn && phase === 'awaiting_response'
  const showPlayerBubbles = !showDice || showRollButton

  // Player bubbles JSX (inline to avoid function recreation)
  const playerBubblesJSX = (
    <div className="flex items-center justify-center gap-3 flex-wrap py-2">
      {players.filter(p => !p.isEliminated).map((player) => {
        const isTurn = player.id === currentTurnPlayerId
        const isMe = player.id === myPlayerId

        return (
          <div
            key={player.id}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-sm
              ${isTurn ? 'bg-brand-blue/30 ring-2 ring-brand-blue' : 'bg-gray-800'}
            `}
          >
            {isTurn && <span className="text-brand-blue">●</span>}
            <span className={isMe ? 'text-brand-blue font-medium' : 'text-white'}>
              {player.name}
              {isMe && <span className="text-gray-500"> (you)</span>}
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: player.tokens }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-token-gold" />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  // Dice display JSX (inline to avoid unmount/remount issues)
  // Using rollId as key forces remount when new roll starts, ensuring animation always plays
  const diceDisplayJSX = (
    <div className="py-3">
      <div className="flex justify-center items-center gap-4">
        <ThreeDDice
          key={`die1-${rollId}`}
          value={myRoll?.die1 || 1}
          isRolling={isRolling}
          size={55}
          delay={0}
        />
        <ThreeDDice
          key={`die2-${rollId}`}
          value={myRoll?.die2 || 1}
          isRolling={isRolling}
          size={55}
          delay={100}
        />
        <div className="text-center min-w-[70px]">
          <span className="text-xl font-bold text-gray-400">= </span>
          {isRolling ? (
            <span className="text-2xl font-bold text-gray-500">??</span>
          ) : myRoll ? (
            <>
              <span className={`text-2xl font-bold ${
                is21 ? 'text-truth-green' : isDoubleClaim ? 'text-token-gold' : 'text-white'
              }`}>
                {myRoll.display}
              </span>
              {is21 && <span className="ml-2 text-truth-green">★</span>}
            </>
          ) : (
            <span className="text-2xl font-bold text-gray-500">??</span>
          )}
        </div>
      </div>
    </div>
  )

  // Not my turn - show status with player bubbles
  if (!isMyTurn) {
    return (
      <div className="space-y-2 pb-3 border-b border-gray-800 mb-3">
        {playerBubblesJSX}
        <p className="text-center text-gray-400 text-sm">
          {currentPlayer?.name}'s turn...
        </p>
      </div>
    )
  }

  // Round start - brief pause
  if (phase === 'round_start') {
    return (
      <div className="space-y-2 pb-3 border-b border-gray-800 mb-3">
        {playerBubblesJSX}
        <p className="text-center text-brand-blue font-medium animate-pulse">
          Round starting...
        </p>
      </div>
    )
  }

  // Need to roll (show dice if rolling, otherwise roll button)
  if (phase === 'awaiting_roll') {
    if (isRolling) {
      return (
        <div className="pb-3 border-b border-gray-800 mb-3">
          {diceDisplayJSX}
        </div>
      )
    }
    return (
      <div className="space-y-3 pb-3 border-b border-gray-800 mb-3">
        {playerBubblesJSX}
        <button
          onClick={onRoll}
          disabled={isLoading}
          className="w-full btn-primary text-lg py-4"
        >
          {isLoading ? 'Rolling...' : 'Roll Dice'}
        </button>
      </div>
    )
  }

  // Need to make a claim - show dice instead of player bubbles
  if (phase === 'awaiting_claim') {
    return (
      <div className="pb-3 border-b border-gray-800 mb-3">
        {diceDisplayJSX}
        <p className="text-center text-gray-300 text-sm mt-2">
          Select your claim below
          {currentClaim && <span className="text-gray-500"> (must beat {currentClaim.display})</span>}
        </p>
      </div>
    )
  }

  // Need to respond to previous claim
  if (phase === 'awaiting_response') {
    // Show dice animation if rolling (after clicking Roll to Beat)
    if (isRolling) {
      return (
        <div className="pb-3 border-b border-gray-800 mb-3">
          {diceDisplayJSX}
        </div>
      )
    }
    return (
      <div className="space-y-3 pb-3 border-b border-gray-800 mb-3">
        {playerBubblesJSX}

        {/* Double stakes indicator for 21 response */}
        {isDoubleStakes && (
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-bluff-red/20 text-bluff-red text-xs font-semibold rounded-full animate-pulse">
              DOUBLE STAKES - 2 tokens at risk!
            </span>
          </div>
        )}

        <p className="text-center text-gray-300 text-sm">
          {previousClaimerName} claims <span className="text-brand-blue font-bold">{currentClaim?.display}</span>
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onRollToBeat}
            disabled={isLoading}
            className="btn-primary py-3"
          >
            {isLoading ? '...' : 'Roll to Beat'}
          </button>
          <button
            onClick={onCallBluff}
            disabled={isLoading}
            className="btn-danger py-3"
          >
            {isLoading ? '...' : 'Call Bluff!'}
          </button>
        </div>

        {/* Pass option for 21 response */}
        {is21Response && onPass && (
          <button
            onClick={onPass}
            disabled={isLoading}
            className="w-full btn-secondary py-3 text-sm"
          >
            {isLoading ? '...' : 'Pass (lose 1 token)'}
          </button>
        )}
      </div>
    )
  }

  // Default waiting state
  return (
    <div className="space-y-2 pb-3 border-b border-gray-800 mb-3">
      {playerBubblesJSX}
      <p className="text-center text-gray-400 text-sm">
        Waiting...
      </p>
    </div>
  )
}
