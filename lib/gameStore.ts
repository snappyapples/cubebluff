/**
 * Cube Bluff - Game Store
 * Database operations for room and game state management
 */

import { supabase, RoomRow, GameStateWithPlayers } from './supabase'
import { GameState, Player, Roll, RoomSettings, PlayerMapping } from './types'
import { initGame } from './gameLogic'

// ============================================================================
// Room Code Generation
// ============================================================================

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars: I, O, 0, 1
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// ============================================================================
// Game Store Class
// ============================================================================

class GameStore {
  /**
   * Create a new room with a host player
   */
  async createRoom(
    hostPlayerId: string,
    hostNickname: string,
    startingTokens: number = 5
  ): Promise<string> {
    const code = generateRoomCode()

    // Initialize with lobby state and host player
    const initialState: GameStateWithPlayers = {
      phase: 'lobby',
      round: 0,
      currentTurnPlayerId: '',
      turnOrder: [],
      currentRoll: null,
      currentClaim: null,
      previousClaimerId: null,
      minimumClaim: null,
      isDoubleStakes: false,
      pendingTwentyOneChoice: false,
      lastResolution: null,
      players: [
        {
          id: 'player-0',
          name: hostNickname,
          tokens: startingTokens,
          isHost: true,
          isConnected: true,
          isEliminated: false,
        },
      ],
      _players: {
        [hostPlayerId]: {
          nickname: hostNickname,
          playerId: 'player-0',
        },
      },
    }

    const { error } = await supabase.from('cb_rooms').insert({
      code,
      host_id: hostPlayerId,
      settings: { startingTokens },
      game_state: initialState,
    })

    if (error) {
      console.error('Error creating room:', error)
      throw new Error('Failed to create room')
    }

    return code
  }

  /**
   * Join an existing room
   */
  async joinRoom(
    roomCode: string,
    playerId: string,
    nickname: string
  ): Promise<{ success: boolean; error?: string }> {
    // Get current room state
    const { data: room, error: fetchError } = await supabase
      .from('cb_rooms')
      .select('*')
      .eq('code', roomCode.toUpperCase())
      .single()

    if (fetchError || !room) {
      return { success: false, error: 'Room not found' }
    }

    const roomData = room as RoomRow
    const gameState = roomData.game_state as GameStateWithPlayers

    if (!gameState) {
      return { success: false, error: 'Invalid room state' }
    }

    // Check if player already in room (allow rejoin even if game started)
    if (gameState._players[playerId]) {
      // Player already joined - just return success (allows rejoin)
      return { success: true }
    }

    // Check if player can rejoin by matching nickname (for robust rejoin)
    const existingPlayerByName = gameState.players.find(
      (p) => p.name.toLowerCase() === nickname.toLowerCase()
    )
    if (existingPlayerByName && gameState.phase !== 'lobby') {
      // Allow rejoin with same nickname during active game
      // Update the player mapping with the new playerId
      const updatedState: GameStateWithPlayers = {
        ...gameState,
        _players: {
          ...gameState._players,
          [playerId]: {
            nickname,
            playerId: existingPlayerByName.id,
          },
        },
      }

      const { error: updateError } = await supabase
        .from('cb_rooms')
        .update({ game_state: updatedState })
        .eq('code', roomCode.toUpperCase())

      if (updateError) {
        console.error('Error rejoining room:', updateError)
        return { success: false, error: 'Failed to rejoin room' }
      }

      return { success: true }
    }

    // Check if game already started (only block new players)
    if (gameState.phase !== 'lobby') {
      return { success: false, error: 'Game has already started' }
    }

    // Check for duplicate nickname (case-insensitive)
    const existingNames = gameState.players.map((p) => p.name.toLowerCase())
    if (existingNames.includes(nickname.toLowerCase())) {
      return { success: false, error: 'That name is already taken' }
    }

    // Check max players (8)
    if (gameState.players.length >= 8) {
      return { success: false, error: 'Room is full (max 8 players)' }
    }

    // Add player
    const playerIndex = gameState.players.length
    const gamePlayerId = `player-${playerIndex}`

    const newPlayer: Player = {
      id: gamePlayerId,
      name: nickname,
      tokens: roomData.settings.startingTokens,
      isHost: false,
      isConnected: true,
      isEliminated: false,
    }

    const updatedState: GameStateWithPlayers = {
      ...gameState,
      players: [...gameState.players, newPlayer],
      _players: {
        ...gameState._players,
        [playerId]: {
          nickname,
          playerId: gamePlayerId,
        },
      },
    }

    const { error: updateError } = await supabase
      .from('cb_rooms')
      .update({ game_state: updatedState })
      .eq('code', roomCode.toUpperCase())

    if (updateError) {
      console.error('Error joining room:', updateError)
      return { success: false, error: 'Failed to join room' }
    }

    return { success: true }
  }

  /**
   * Get room by code
   */
  async getRoom(roomCode: string): Promise<{
    room: RoomRow | null
    gameState: GameState | null
    playerMapping: Record<string, PlayerMapping> | null
  }> {
    const { data: room, error } = await supabase
      .from('cb_rooms')
      .select('*')
      .eq('code', roomCode.toUpperCase())
      .single()

    if (error || !room) {
      return { room: null, gameState: null, playerMapping: null }
    }

    const roomData = room as RoomRow
    const fullState = roomData.game_state as GameStateWithPlayers | null

    if (!fullState) {
      return { room: roomData, gameState: null, playerMapping: null }
    }

    // Extract player mapping
    const playerMapping = fullState._players

    // Create clean GameState without _players
    const { _players, ...gameState } = fullState

    return {
      room: roomData,
      gameState: gameState as GameState,
      playerMapping,
    }
  }

  /**
   * Get the game player ID for a localStorage player ID
   */
  async getPlayerGameId(
    roomCode: string,
    playerId: string
  ): Promise<string | undefined> {
    const { gameState, playerMapping } = await this.getRoom(roomCode)

    if (!playerMapping) return undefined

    return playerMapping[playerId]?.playerId
  }

  /**
   * Start the game (host only)
   */
  async startGame(
    roomCode: string,
    hostPlayerId: string
  ): Promise<{ success: boolean; error?: string }> {
    const { room, playerMapping } = await this.getRoom(roomCode)

    if (!room) {
      return { success: false, error: 'Room not found' }
    }

    // Verify host
    if (room.host_id !== hostPlayerId) {
      return { success: false, error: 'Only the host can start the game' }
    }

    const fullState = room.game_state as GameStateWithPlayers

    // Check minimum players
    if (fullState.players.length < 2) {
      return { success: false, error: 'Need at least 2 players to start' }
    }

    // Initialize game with current players
    const playerData = fullState.players.map((p) => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
    }))

    const newGameState = initGame(playerData, room.settings.startingTokens)

    // Merge with player mapping
    const updatedState: GameStateWithPlayers = {
      ...newGameState,
      _players: fullState._players,
    }

    const { error } = await supabase
      .from('cb_rooms')
      .update({ game_state: updatedState })
      .eq('code', roomCode.toUpperCase())

    if (error) {
      console.error('Error starting game:', error)
      return { success: false, error: 'Failed to start game' }
    }

    return { success: true }
  }

  /**
   * Update game state
   */
  async updateGameState(
    roomCode: string,
    gameState: GameState,
    currentRoll?: Roll // Optional: store actual roll separately for security
  ): Promise<boolean> {
    const { room, playerMapping } = await this.getRoom(roomCode)

    if (!room || !playerMapping) {
      return false
    }

    // Merge with player mapping
    const updatedState: GameStateWithPlayers = {
      ...gameState,
      _players: playerMapping,
    }

    const { error } = await supabase
      .from('cb_rooms')
      .update({ game_state: updatedState })
      .eq('code', roomCode.toUpperCase())

    if (error) {
      console.error('Error updating game state:', error)
      return false
    }

    return true
  }

  /**
   * Store the current roll (called after roll, before state update)
   * This keeps the actual roll server-side
   */
  async storeCurrentRoll(roomCode: string, roll: Roll): Promise<boolean> {
    const { room, playerMapping } = await this.getRoom(roomCode)

    if (!room) return false

    const fullState = room.game_state as GameStateWithPlayers

    const updatedState: GameStateWithPlayers = {
      ...fullState,
      currentRoll: roll,
      _players: playerMapping || {},
    }

    const { error } = await supabase
      .from('cb_rooms')
      .update({ game_state: updatedState })
      .eq('code', roomCode.toUpperCase())

    return !error
  }

  /**
   * Get the stored roll for the current round (for bluff resolution)
   */
  async getCurrentRoll(roomCode: string): Promise<Roll | null> {
    const { room } = await this.getRoom(roomCode)

    if (!room) return null

    const fullState = room.game_state as GameStateWithPlayers
    return fullState.currentRoll
  }

  /**
   * Update room settings (host only, lobby phase only)
   */
  async updateSettings(
    roomCode: string,
    hostPlayerId: string,
    settings: Partial<RoomSettings>
  ): Promise<{ success: boolean; error?: string }> {
    const { room } = await this.getRoom(roomCode)

    if (!room) {
      return { success: false, error: 'Room not found' }
    }

    if (room.host_id !== hostPlayerId) {
      return { success: false, error: 'Only the host can change settings' }
    }

    const fullState = room.game_state as GameStateWithPlayers
    if (fullState.phase !== 'lobby') {
      return { success: false, error: 'Cannot change settings after game starts' }
    }

    // Update settings and player tokens
    const newSettings = { ...room.settings, ...settings }

    const updatedPlayers = fullState.players.map((p) => ({
      ...p,
      tokens: newSettings.startingTokens,
    }))

    const updatedState: GameStateWithPlayers = {
      ...fullState,
      players: updatedPlayers,
    }

    const { error } = await supabase
      .from('cb_rooms')
      .update({
        settings: newSettings,
        game_state: updatedState,
      })
      .eq('code', roomCode.toUpperCase())

    if (error) {
      console.error('Error updating settings:', error)
      return { success: false, error: 'Failed to update settings' }
    }

    return { success: true }
  }

  /**
   * Restart the game in the same room
   */
  async restartRoom(
    roomCode: string,
    newHostPlayerId: string,
    newHostNickname: string
  ): Promise<{ success: boolean; error?: string }> {
    const { room } = await this.getRoom(roomCode)

    if (!room) {
      return { success: false, error: 'Room not found' }
    }

    // Reset to lobby with new host
    const initialState: GameStateWithPlayers = {
      phase: 'lobby',
      round: 0,
      currentTurnPlayerId: '',
      turnOrder: [],
      currentRoll: null,
      currentClaim: null,
      previousClaimerId: null,
      minimumClaim: null,
      isDoubleStakes: false,
      pendingTwentyOneChoice: false,
      lastResolution: null,
      players: [
        {
          id: 'player-0',
          name: newHostNickname,
          tokens: room.settings.startingTokens,
          isHost: true,
          isConnected: true,
          isEliminated: false,
        },
      ],
      _players: {
        [newHostPlayerId]: {
          nickname: newHostNickname,
          playerId: 'player-0',
        },
      },
    }

    const { error } = await supabase
      .from('cb_rooms')
      .update({
        host_id: newHostPlayerId,
        game_state: initialState,
      })
      .eq('code', roomCode.toUpperCase())

    if (error) {
      console.error('Error restarting room:', error)
      return { success: false, error: 'Failed to restart room' }
    }

    return { success: true }
  }
}

// Export singleton instance
export const gameStore = new GameStore()
