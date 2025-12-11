/**
 * Cube Bluff - Game Logic
 * Pure functions for game state management (no side effects)
 */

import {
  GameState,
  GamePhase,
  Player,
  Roll,
  Resolution,
  ClaimHistoryEntry,
  createRoll,
  isTwentyOne,
  rollBeatsMinimum,
} from './types'

// ============================================================================
// Game Initialization
// ============================================================================

/**
 * Initialize a new game with the given players
 */
export function initGame(
  playerData: Array<{ id: string; name: string; isHost: boolean }>,
  startingTokens: number
): GameState {
  // Create player objects sorted by ID for consistent order
  const sortedData = [...playerData].sort((a, b) => a.id.localeCompare(b.id))

  const players: Player[] = sortedData.map((p) => ({
    id: p.id,
    name: p.name,
    tokens: startingTokens,
    isHost: p.isHost,
    isConnected: true,
    isEliminated: false,
  }))

  // Turn order is the player IDs in sorted order
  const turnOrder = players.map((p) => p.id)

  return {
    phase: 'round_start',
    round: 1,
    currentTurnPlayerId: turnOrder[Math.floor(Math.random() * turnOrder.length)],
    turnOrder,
    players,
    currentRoll: null,
    currentClaim: null,
    previousClaimerId: null,
    minimumClaim: null,
    claimHistory: [],
    isDoubleStakes: false,
    pendingTwentyOneChoice: false,
    is21Response: false,
    lastResolution: null,
    roundEndAt: Date.now(), // Brief pause before first round
  }
}

// ============================================================================
// Dice Rolling
// ============================================================================

/**
 * Generate a random dice roll (server-side only!)
 */
export function generateRoll(): Roll {
  const die1 = Math.floor(Math.random() * 6) + 1
  const die2 = Math.floor(Math.random() * 6) + 1
  return createRoll(die1, die2)
}

/**
 * Apply a roll to the game state
 * Called when a player rolls (either first roll or roll-to-beat)
 * Note: 21 is no longer special at roll time - it's handled when claimed
 */
export function applyRoll(state: GameState, roll: Roll): GameState {
  return {
    ...state,
    phase: 'awaiting_claim',
    currentRoll: roll,
  }
}

// ============================================================================
// Claims
// ============================================================================

/**
 * Process a claim made by the current player
 */
export function makeClaim(
  state: GameState,
  playerId: string,
  claim: Roll
): GameState {
  // Validate: must be current player
  if (state.currentTurnPlayerId !== playerId) {
    throw new Error('Not your turn')
  }

  // Validate: claim must be >= minimum (if there is one)
  if (state.minimumClaim && !rollBeatsMinimum(claim, state.minimumClaim)) {
    throw new Error('Claim must be higher than or equal to previous claim')
  }

  // Find next active player
  const nextPlayerId = getNextActivePlayer(state, playerId)

  // Get player name for history
  const player = state.players.find((p) => p.id === playerId)
  const playerName = player?.name || 'Unknown'

  // Add to claim history
  const historyEntry: ClaimHistoryEntry = {
    claim,
    playerId,
    playerName,
  }

  // If claiming 21, mark double stakes and show 21 response options
  const is21Claim = isTwentyOne(claim)

  return {
    ...state,
    phase: 'awaiting_response', // Always go to response phase now
    currentClaim: claim,
    previousClaimerId: playerId,
    minimumClaim: claim, // Next claim must be >= this
    currentTurnPlayerId: nextPlayerId,
    claimHistory: [...(state.claimHistory || []), historyEntry],
    pendingTwentyOneChoice: is21Claim, // Still track for pass option
    isDoubleStakes: is21Claim ? true : state.isDoubleStakes, // 21 = double stakes automatically
    is21Response: is21Claim, // New flag to show Pass option in ActionPanel
    // Keep currentRoll so it can be revealed when bluff is called
  }
}

// ============================================================================
// Bluff Calling
// ============================================================================

/**
 * Process a bluff call
 * Returns the state with resolution info
 */
export function callBluff(
  state: GameState,
  callerId: string,
  actualRoll: Roll // The actual roll from the previous player (stored server-side)
): GameState {
  if (!state.currentClaim || !state.previousClaimerId) {
    throw new Error('No claim to challenge')
  }

  const claim = state.currentClaim

  // Check if the claimer was lying
  // Lying = actual roll is LOWER than claimed (higher rank number)
  const wasLying = actualRoll.rank > claim.rank

  // Determine who loses tokens
  const loserId = wasLying ? state.previousClaimerId : callerId
  const tokensLost = state.isDoubleStakes ? 2 : 1

  // Update player tokens
  const updatedPlayers = state.players.map((p) => {
    if (p.id === loserId) {
      const newTokens = Math.max(0, p.tokens - tokensLost)
      return {
        ...p,
        tokens: newTokens,
        isEliminated: newTokens === 0,
        eliminatedRound: newTokens === 0 ? state.round : p.eliminatedRound,
      }
    }
    return p
  })

  const resolution: Resolution = {
    type: wasLying ? 'bluff_success' : 'bluff_fail',
    actualRoll,
    claim,
    claimerId: state.previousClaimerId!,
    callerId,
    loserId,
    tokensLost,
  }

  // Check if loser was eliminated
  const loser = updatedPlayers.find((p) => p.id === loserId)
  const wasEliminated = loser?.isEliminated

  // Check if game is over (only one player left)
  const activePlayers = updatedPlayers.filter((p) => !p.isEliminated)
  const gameOver = activePlayers.length <= 1

  let nextPhase: GamePhase = 'resolving_bluff'
  if (gameOver) {
    nextPhase = 'finished'
  } else if (wasEliminated) {
    nextPhase = 'player_eliminated'
  }

  return {
    ...state,
    phase: nextPhase,
    players: updatedPlayers,
    lastResolution: resolution,
    resolutionAt: Date.now(),
    eliminationAt: wasEliminated ? Date.now() : undefined,
    // Clear round state
    currentRoll: null,
    currentClaim: null,
    previousClaimerId: null,
    is21Response: false,
  }
}

// ============================================================================
// Twenty-One Handling
// ============================================================================

/**
 * Handle the 21 pass choice
 * Called when player chooses to pass instead of responding to a 21 claim
 * (Double stakes is now automatic - player can roll-to-beat or call bluff directly)
 */
export function handleTwentyOneChoice(
  state: GameState,
  playerId: string,
  choice: 'pass'
): GameState {
  if (state.currentTurnPlayerId !== playerId) {
    throw new Error('Not your turn')
  }

  if (!state.pendingTwentyOneChoice && !state.is21Response) {
    throw new Error('No 21 response pending')
  }

  // Player passes the 21 - pay 1 token, start fresh round
  const updatedPlayers = state.players.map((p) => {
    if (p.id === playerId) {
      const newTokens = Math.max(0, p.tokens - 1)
      return {
        ...p,
        tokens: newTokens,
        isEliminated: newTokens === 0,
        eliminatedRound: newTokens === 0 ? state.round : p.eliminatedRound,
      }
    }
    return p
  })

  const passer = updatedPlayers.find((p) => p.id === playerId)
  const wasEliminated = passer?.isEliminated

  // Check if game is over
  const activePlayers = updatedPlayers.filter((p) => !p.isEliminated)
  if (activePlayers.length <= 1) {
    return {
      ...state,
      phase: 'finished',
      players: updatedPlayers,
      lastResolution: {
        type: 'pass_21',
        actualRoll: state.currentClaim!, // The claim, not the actual roll
        claim: state.currentClaim!,
        claimerId: state.previousClaimerId!,
        loserId: playerId,
        tokensLost: 1,
      },
      pendingTwentyOneChoice: false,
      is21Response: false,
    }
  }

  if (wasEliminated) {
    // Find next player to start fresh round after elimination delay
    const nextPlayerId = getNextActivePlayer({ ...state, players: updatedPlayers }, playerId)

    return {
      ...state,
      phase: 'player_eliminated',
      players: updatedPlayers,
      lastResolution: {
        type: 'pass_21',
        actualRoll: state.currentClaim!,
        claim: state.currentClaim!,
        claimerId: state.previousClaimerId!,
        loserId: playerId,
        tokensLost: 1,
      },
      eliminationAt: Date.now(),
      currentTurnPlayerId: nextPlayerId,
      is21Response: false,
    }
  }

  // Pass on 21 - start a fresh round with the next player
  const nextPlayerId = getNextActivePlayer({ ...state, players: updatedPlayers }, playerId)

  // Manually start fresh round (don't use startNewRound as it calculates its own starter)
  return {
    ...state,
    phase: 'round_start',
    round: state.round + 1,
    players: updatedPlayers,
    currentTurnPlayerId: nextPlayerId,
    currentRoll: null,
    currentClaim: null,
    previousClaimerId: null,
    minimumClaim: null,
    claimHistory: [],
    isDoubleStakes: false,
    pendingTwentyOneChoice: false,
    is21Response: false,
    lastResolution: null,
    bluffVotes: {},
    roundEndAt: Date.now(),
  }
}

// ============================================================================
// Round Management
// ============================================================================

/**
 * Start a new round
 */
export function startNewRound(state: GameState): GameState {
  const activePlayers = state.players.filter((p) => !p.isEliminated)

  if (activePlayers.length <= 1) {
    return {
      ...state,
      phase: 'finished',
    }
  }

  // Find next starting player
  // If a bluff was called, the caller starts the next round
  let nextStarterId: string
  if (state.lastResolution?.callerId) {
    // Bluff was called - caller starts next round
    const callerIsActive = activePlayers.some(p => p.id === state.lastResolution!.callerId)
    if (callerIsActive) {
      nextStarterId = state.lastResolution.callerId
    } else {
      // Caller was eliminated, use next active player after caller
      nextStarterId = getNextActivePlayer(state, state.lastResolution.callerId)
    }
  } else if (state.lastResolution) {
    // pass_21 type - use next active player after loser
    nextStarterId = getNextActivePlayer(state, state.lastResolution.loserId)
  } else {
    // First round or no resolution - use first active player
    nextStarterId = activePlayers[0].id
  }

  return {
    ...state,
    phase: 'round_start',
    round: state.round + 1,
    currentTurnPlayerId: nextStarterId,
    currentRoll: null,
    currentClaim: null,
    previousClaimerId: null,
    minimumClaim: null,
    claimHistory: [],
    isDoubleStakes: false,
    pendingTwentyOneChoice: false,
    is21Response: false,
    lastResolution: null,
    bluffVotes: {}, // Clear votes for new round
    roundEndAt: Date.now(),
  }
}

/**
 * Transition from round_start to awaiting_roll
 */
export function beginRound(state: GameState): GameState {
  return {
    ...state,
    phase: 'awaiting_roll',
    roundEndAt: undefined,
  }
}

// ============================================================================
// Auto-Transitions (called on polling)
// ============================================================================

const RESOLUTION_DELAY = 6000 // Show bluff resolution for 6 seconds
const ROUND_END_DELAY = 2000 // Pause between rounds for 2 seconds
const ELIMINATION_DELAY = 3000 // Show elimination for 3 seconds

/**
 * Check and apply any auto-transitions based on timestamps
 */
export function checkAutoTransitions(state: GameState): GameState {
  const now = Date.now()

  // Round start -> awaiting_roll after brief pause
  if (state.phase === 'round_start' && state.roundEndAt) {
    if (now - state.roundEndAt >= ROUND_END_DELAY) {
      return beginRound(state)
    }
  }

  // Resolving bluff -> round_end or finished
  if (state.phase === 'resolving_bluff' && state.resolutionAt) {
    if (now - state.resolutionAt >= RESOLUTION_DELAY) {
      // Start new round
      return startNewRound(state)
    }
  }

  // Player eliminated -> round_end or finished
  if (state.phase === 'player_eliminated' && state.eliminationAt) {
    if (now - state.eliminationAt >= ELIMINATION_DELAY) {
      const activePlayers = state.players.filter((p) => !p.isEliminated)
      if (activePlayers.length <= 1) {
        return { ...state, phase: 'finished' }
      }
      return startNewRound(state)
    }
  }

  return state
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get the next active (non-eliminated) player after the given player
 */
export function getNextActivePlayer(state: GameState, currentId: string): string {
  const { turnOrder, players } = state
  const currentIndex = turnOrder.indexOf(currentId)

  // Find next non-eliminated player
  for (let i = 1; i <= turnOrder.length; i++) {
    const nextIndex = (currentIndex + i) % turnOrder.length
    const nextId = turnOrder[nextIndex]
    const nextPlayer = players.find((p) => p.id === nextId)
    if (nextPlayer && !nextPlayer.isEliminated) {
      return nextId
    }
  }

  // Should never happen if game is valid
  return turnOrder[0]
}

/**
 * Get the winner(s) of the game
 */
export function getWinners(state: GameState): Player[] {
  const activePlayers = state.players.filter((p) => !p.isEliminated)

  if (activePlayers.length === 1) {
    return activePlayers
  }

  // If somehow multiple players are active, return the one(s) with most tokens
  const maxTokens = Math.max(...activePlayers.map((p) => p.tokens))
  return activePlayers.filter((p) => p.tokens === maxTokens)
}

/**
 * Get current player
 */
export function getCurrentPlayer(state: GameState): Player | undefined {
  return state.players.find((p) => p.id === state.currentTurnPlayerId)
}

/**
 * Check if a player is the current turn player
 */
export function isPlayersTurn(state: GameState, playerId: string): boolean {
  return state.currentTurnPlayerId === playerId
}

/**
 * Get player by ID
 */
export function getPlayer(state: GameState, playerId: string): Player | undefined {
  return state.players.find((p) => p.id === playerId)
}
