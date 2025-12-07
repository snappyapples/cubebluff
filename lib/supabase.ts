import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Room row in the database
 */
export interface RoomRow {
  code: string
  host_id: string
  settings: {
    startingTokens: number
  }
  game_state: GameStateWithPlayers | null
  created_at: string
  updated_at: string
}

/**
 * Game state with embedded players mapping
 * The _players field maps localStorage playerId to game player info
 */
export interface GameStateWithPlayers {
  phase: string
  round: number
  currentTurnPlayerId: string
  turnOrder: string[]
  currentRoll: { die1: number; die2: number; display: string; rank: number } | null
  currentClaim: { die1: number; die2: number; display: string; rank: number } | null
  previousClaimerId: string | null
  minimumClaim: { die1: number; die2: number; display: string; rank: number } | null
  isDoubleStakes: boolean
  pendingTwentyOneChoice: boolean
  lastResolution: {
    type: 'bluff_success' | 'bluff_fail' | 'pass_21'
    actualRoll: { die1: number; die2: number; display: string; rank: number }
    claim: { die1: number; die2: number; display: string; rank: number }
    loserId: string
    tokensLost: number
  } | null
  players: Array<{
    id: string
    name: string
    tokens: number
    isHost: boolean
    isConnected: boolean
    isEliminated: boolean
    eliminatedRound?: number
  }>
  // Player mapping: localStorage playerId -> game player info
  _players: Record<string, {
    nickname: string
    playerId: string  // The game player ID (e.g., 'player-0')
  }>
  // Timestamps for auto-transitions
  resolutionAt?: number
  roundEndAt?: number
  eliminationAt?: number
}
