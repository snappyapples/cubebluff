// Cube Bluff - Type Definitions

/**
 * Roll representation
 * Dice are arranged into a two-digit number, higher die first
 */
export interface Roll {
  die1: number        // 1-6
  die2: number        // 1-6
  display: string     // "53", "21", etc.
  rank: number        // 1-21 (1 = highest, 21 = lowest)
}

/**
 * Player in the game
 */
export interface Player {
  id: string
  name: string
  tokens: number
  isHost: boolean
  isConnected: boolean
  isEliminated: boolean
  eliminatedRound?: number
}

/**
 * Room settings
 */
export interface RoomSettings {
  startingTokens: number  // 3, 5, 7, or 10
}

/**
 * Room containing players and game state
 */
export interface Room {
  code: string        // 6-char code
  hostId: string
  players: Player[]
  settings: RoomSettings
  gameState: GameState | null
  createdAt: Date
}

/**
 * Game phases
 */
export type GamePhase =
  | 'lobby'              // Waiting for players
  | 'round_start'        // Brief pause before round
  | 'awaiting_roll'      // Player must roll
  | 'awaiting_21_choice' // Player rolled 21, must choose
  | 'awaiting_claim'     // Player has rolled, must claim
  | 'awaiting_response'  // Next player must roll-to-beat or call bluff
  | 'resolving_bluff'    // Showing bluff resolution
  | 'round_end'          // Brief pause before next round
  | 'player_eliminated'  // Showing elimination
  | 'finished'           // Game over

/**
 * Resolution result for bluff calls
 */
export interface Resolution {
  type: 'bluff_success' | 'bluff_fail' | 'pass_21'
  actualRoll: Roll
  claim: Roll
  claimerId: string    // Who made the claim that was challenged
  callerId?: string    // Who called the bluff (undefined for pass_21)
  loserId: string
  tokensLost: number
}

/**
 * Claim history entry for tracking all claims in a round
 */
export interface ClaimHistoryEntry {
  claim: Roll
  playerId: string
  playerName: string
}

/**
 * Complete game state
 */
export interface GameState {
  phase: GamePhase
  round: number
  currentTurnPlayerId: string
  turnOrder: string[]           // Player IDs in order
  players: Player[]             // All players in the game

  // Current round state
  currentRoll: Roll | null      // Actual roll (server only sends to roller)
  currentClaim: Roll | null     // Claimed roll (public)
  previousClaimerId: string | null
  minimumClaim: Roll | null     // Next claim must be >= this
  claimHistory: ClaimHistoryEntry[]  // All claims this round

  // Special states
  isDoubleStakes: boolean       // 21 was called
  pendingTwentyOneChoice: boolean

  // Resolution
  lastResolution: Resolution | null

  // Crowd voting - players guess if current claim is bluff or truth
  bluffVotes?: { [playerId: string]: 'bluff' | 'truth' }

  // Timestamps for auto-transitions (milliseconds since epoch)
  resolutionAt?: number         // When bluff was resolved (show for 4 seconds)
  roundEndAt?: number           // When round ended (show for 2 seconds)
  eliminationAt?: number        // When player was eliminated (show for 3 seconds)
}

/**
 * Player mapping stored in database
 * Maps localStorage playerId to game player info
 */
export interface PlayerMapping {
  nickname: string
  playerId: string  // The game player ID (e.g., 'player-0')
}

// ============================================================================
// Roll Ranking Utilities
// ============================================================================

/**
 * All possible rolls in order from highest (rank 1) to lowest (rank 21)
 */
export const ROLL_RANKINGS: string[] = [
  '21',  // Rank 1 (highest) - Special
  '66', '55', '44', '33', '22', '11',  // Doubles (ranks 2-7)
  '65', '64', '63', '62', '61',        // Non-doubles (ranks 8-12)
  '54', '53', '52', '51',              // (ranks 13-16)
  '43', '42', '41',                    // (ranks 17-19)
  '32', '31'                           // (ranks 20-21, lowest)
]

/**
 * Create a Roll object from two dice values
 */
export function createRoll(die1: number, die2: number): Roll {
  // Arrange with higher die first
  const high = Math.max(die1, die2)
  const low = Math.min(die1, die2)
  const display = `${high}${low}`

  // Find rank (1 = highest, 21 = lowest)
  const rank = ROLL_RANKINGS.indexOf(display) + 1

  return {
    die1: high,
    die2: low,
    display,
    rank
  }
}

/**
 * Get rank of a roll display string (1 = highest, 21 = lowest)
 */
export function getRollRank(display: string): number {
  const index = ROLL_RANKINGS.indexOf(display)
  return index === -1 ? 999 : index + 1
}

/**
 * Compare two rolls
 * Returns negative if a > b, positive if a < b, 0 if equal
 * (Lower rank = higher roll)
 */
export function compareRolls(a: Roll, b: Roll): number {
  return a.rank - b.rank
}

/**
 * Check if a roll beats the minimum (is >= minimum)
 * Lower rank = higher roll, so beats if rank <= minimum rank
 */
export function rollBeatsMinimum(roll: Roll, minimum: Roll): boolean {
  return roll.rank <= minimum.rank
}

/**
 * Get all valid claims (rolls >= minimum)
 */
export function getValidClaims(minimum: Roll | null): Roll[] {
  if (!minimum) {
    // All rolls are valid if no minimum
    return ROLL_RANKINGS.map((display, index) => {
      const die1 = parseInt(display[0])
      const die2 = parseInt(display[1])
      return {
        die1,
        die2,
        display,
        rank: index + 1
      }
    })
  }

  // Only rolls with rank <= minimum rank
  return ROLL_RANKINGS
    .slice(0, minimum.rank)  // All rolls from 0 to minimum index (inclusive)
    .map((display, index) => {
      const die1 = parseInt(display[0])
      const die2 = parseInt(display[1])
      return {
        die1,
        die2,
        display,
        rank: index + 1
      }
    })
}

/**
 * Check if a roll is 21 (the special highest roll)
 */
export function isTwentyOne(roll: Roll): boolean {
  return roll.display === '21'
}

/**
 * Check if a roll is a double
 */
export function isDouble(roll: Roll): boolean {
  return roll.die1 === roll.die2
}
