'use client'

import { useState, useEffect, use, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import ActionPanel from '@/components/ActionPanel'
import ClaimList from '@/components/ClaimList'
import TwentyOneModal from '@/components/TwentyOneModal'
import BluffResolution from '@/components/BluffResolution'
import GameOverScreen from '@/components/GameOverScreen'
import RulesModal from '@/components/RulesModal'
import ClaimAnnouncement from '@/components/ClaimAnnouncement'
import BluffVoting from '@/components/BluffVoting'
import { GameState, Roll, Player, Resolution } from '@/lib/types'

const POLL_INTERVAL = 2000 // 2 seconds

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params)
  const router = useRouter()

  // State
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [myGamePlayerId, setMyGamePlayerId] = useState<string | null>(null)
  const [myRoll, setMyRoll] = useState<Roll | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [showRollResult, setShowRollResult] = useState(false)
  const [rollId, setRollId] = useState(0) // Increment to force dice animation restart
  const [pendingGameState, setPendingGameState] = useState<GameState | null>(null)
  const isRollingRef = useRef(false) // Ref to track rolling state for polling
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [joinError, setJoinError] = useState('')
  const [hostPlayerId, setHostPlayerId] = useState('')
  const [settings, setSettings] = useState({ startingTokens: 5 })
  const [showRules, setShowRules] = useState(false)
  const [copied, setCopied] = useState(false)
  const [cachedResolution, setCachedResolution] = useState<Resolution | null>(null)
  const rollInProgressRef = useRef(false) // Debounce protection for rolls
  const [lastSeenClaim, setLastSeenClaim] = useState<string | null>(null)
  const [showClaimAnnouncement, setShowClaimAnnouncement] = useState(false)

  // Join form state
  const [nickname, setNickname] = useState('')
  const [needsToJoin, setNeedsToJoin] = useState(false)

  // Get current player info
  const playerId = typeof window !== 'undefined' ? localStorage.getItem('playerId') : null
  const isHost = playerId === hostPlayerId
  const myPlayer = gameState?.players.find(p => p.id === myGamePlayerId)
  const isMyTurn = gameState?.currentTurnPlayerId === myGamePlayerId
  const previousClaimer = gameState?.previousClaimerId
    ? gameState.players.find(p => p.id === gameState.previousClaimerId)
    : null

  // Fetch room state
  const fetchState = useCallback(async () => {
    // Skip polling updates while dice are animating to prevent disruption
    if (isRollingRef.current) return

    try {
      const response = await fetch(`/api/rooms/${roomId}`)
      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Room not found')
        return
      }

      setGameState(data.gameState)
      setHostPlayerId(data.hostPlayerId)
      setSettings(data.settings)

      // Check if current player is in the game
      const currentNickname = localStorage.getItem('nickname')

      if (data.gameState?.players) {
        // Try to find this player in the room by nickname
        const playerInGame = currentNickname
          ? data.gameState.players.find((p: Player) => p.name === currentNickname)
          : null

        if (playerInGame) {
          setMyGamePlayerId(playerInGame.id)
          setNeedsToJoin(false)
        } else if (data.gameState.phase === 'lobby') {
          // Not in room and lobby is open - show join form
          setNeedsToJoin(true)
        } else {
          // Not in room and game already started
          setNeedsToJoin(true)
          setJoinError('Game has already started')
        }
      }

      setError('')
    } catch (err) {
      setError('Failed to connect to room')
    }
  }, [roomId])

  // Initial load and polling
  useEffect(() => {
    // Check for room-specific stored nickname first (for robust rejoin)
    const roomNickname = localStorage.getItem(`room_${roomId}_nickname`)
    const globalNickname = localStorage.getItem('nickname')

    // Prefer room-specific nickname for this room, fall back to global
    if (roomNickname) {
      setNickname(roomNickname)
      // Also update global nickname to match
      localStorage.setItem('nickname', roomNickname)
    } else if (globalNickname) {
      setNickname(globalNickname)
    }

    fetchState()
    const interval = setInterval(fetchState, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchState, roomId])

  // Cache resolution to prevent null issues during state transitions
  useEffect(() => {
    if (gameState?.lastResolution) {
      setCachedResolution(gameState.lastResolution)
    }
  }, [gameState?.lastResolution])

  // Clear cached resolution when phase leaves resolution display
  useEffect(() => {
    if (gameState?.phase !== 'resolving_bluff' && gameState?.phase !== 'player_eliminated') {
      // Delay clearing so animation can complete
      const timer = setTimeout(() => setCachedResolution(null), 500)
      return () => clearTimeout(timer)
    }
  }, [gameState?.phase])

  // Detect new claims for announcement popup
  useEffect(() => {
    if (gameState?.currentClaim && gameState.phase === 'awaiting_response') {
      const claimKey = `${gameState.currentClaim.display}-${gameState.previousClaimerId}`
      if (claimKey !== lastSeenClaim) {
        setLastSeenClaim(claimKey)
        setShowClaimAnnouncement(true)
      }
    } else if (!gameState?.currentClaim) {
      setLastSeenClaim(null)
      setShowClaimAnnouncement(false)
    }
  }, [gameState?.currentClaim?.display, gameState?.previousClaimerId, gameState?.phase])

  // Handle join
  const handleJoin = async () => {
    if (!nickname.trim()) {
      setJoinError('Please enter your name')
      return
    }

    setIsLoading(true)
    setJoinError('')

    try {
      let currentPlayerId = localStorage.getItem('playerId')
      if (!currentPlayerId) {
        currentPlayerId = crypto.randomUUID()
        localStorage.setItem('playerId', currentPlayerId)
      }
      localStorage.setItem('nickname', nickname.trim())

      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentPlayerId,
          nickname: nickname.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store room membership for robust rejoin
        localStorage.setItem(`room_${roomId}_joined`, 'true')
        localStorage.setItem(`room_${roomId}_nickname`, nickname.trim())
        setNeedsToJoin(false)
        fetchState()
      } else {
        setJoinError(data.error || 'Failed to join')
      }
    } catch (err) {
      setJoinError('Failed to join room')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle start game
  const handleStartGame = async () => {
    setIsLoading(true)
    try {
      const currentPlayerId = localStorage.getItem('playerId')
      const response = await fetch(`/api/rooms/${roomId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentPlayerId }),
      })

      const data = await response.json()
      if (!data.success) {
        setError(data.error || 'Failed to start game')
      } else {
        fetchState()
      }
    } catch (err) {
      setError('Failed to start game')
    } finally {
      setIsLoading(false)
    }
  }

  // Animation timing constant
  const ROLL_DURATION = 2500

  // Handle roll
  const handleRoll = async () => {
    // Debounce protection - prevent double-clicks during animation
    if (rollInProgressRef.current) return
    rollInProgressRef.current = true
    setIsLoading(true)

    try {
      const currentPlayerId = localStorage.getItem('playerId')
      const response = await fetch(`/api/rooms/${roomId}/roll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentPlayerId }),
      })

      const data = await response.json()

      if (data.success && data.roll) {
        // Block polling during animation
        isRollingRef.current = true
        // Increment rollId to force dice remount and animation
        setRollId(prev => prev + 1)
        // Start animation first, then set values (like dice-test)
        setIsRolling(true)
        setShowRollResult(false)
        setMyRoll(data.roll)
        // Store game state but don't apply it yet
        setPendingGameState(data.gameState)

        // After animation completes, show result and apply game state
        setTimeout(() => {
          setShowRollResult(true)
          setIsRolling(false)
          isRollingRef.current = false // Resume polling
          rollInProgressRef.current = false // Release debounce lock
          setGameState(data.gameState)
          setPendingGameState(null)
        }, ROLL_DURATION + 100)
      } else {
        setError(data.error || 'Failed to roll')
        rollInProgressRef.current = false // Release debounce lock on error
      }
    } catch (err) {
      setError('Failed to roll')
      rollInProgressRef.current = false // Release debounce lock on error
    } finally {
      setIsLoading(false)
    }
  }

  // Handle claim
  const handleClaim = async (claim: Roll) => {
    setIsLoading(true)

    try {
      const currentPlayerId = localStorage.getItem('playerId')
      const response = await fetch(`/api/rooms/${roomId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentPlayerId,
          claim: { die1: claim.die1, die2: claim.die2 },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGameState(data.gameState)
        setMyRoll(null) // Clear after claiming
      } else {
        setError(data.error || 'Failed to make claim')
      }
    } catch (err) {
      setError('Failed to make claim')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle roll to beat
  const handleRollToBeat = async () => {
    // Debounce protection - prevent double-clicks during animation
    if (rollInProgressRef.current) return
    rollInProgressRef.current = true
    setIsLoading(true)

    try {
      const currentPlayerId = localStorage.getItem('playerId')
      const response = await fetch(`/api/rooms/${roomId}/roll-to-beat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentPlayerId }),
      })

      const data = await response.json()

      if (data.success && data.roll) {
        // Block polling during animation
        isRollingRef.current = true
        // Increment rollId to force dice remount and animation
        setRollId(prev => prev + 1)
        // Start animation first, then set values (like dice-test)
        setIsRolling(true)
        setShowRollResult(false)
        setMyRoll(data.roll)
        // Store game state but don't apply it yet
        setPendingGameState(data.gameState)

        // After animation completes, show result and apply game state
        setTimeout(() => {
          setShowRollResult(true)
          setIsRolling(false)
          isRollingRef.current = false // Resume polling
          rollInProgressRef.current = false // Release debounce lock
          setGameState(data.gameState)
          setPendingGameState(null)
        }, ROLL_DURATION + 100)
      } else {
        setError(data.error || 'Failed to roll')
        rollInProgressRef.current = false // Release debounce lock on error
      }
    } catch (err) {
      setError('Failed to roll')
      rollInProgressRef.current = false // Release debounce lock on error
    } finally {
      setIsLoading(false)
    }
  }

  // Handle call bluff
  const handleCallBluff = async () => {
    setIsLoading(true)

    try {
      const currentPlayerId = localStorage.getItem('playerId')
      const response = await fetch(`/api/rooms/${roomId}/bluff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentPlayerId }),
      })

      const data = await response.json()

      if (data.success) {
        setGameState(data.gameState)
        setMyRoll(null)
      } else {
        setError(data.error || 'Failed to call bluff')
      }
    } catch (err) {
      setError('Failed to call bluff')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle 21 choice
  const handleTwentyOneChoice = async (choice: 'double_stakes' | 'pass') => {
    setIsLoading(true)

    try {
      const currentPlayerId = localStorage.getItem('playerId')
      const response = await fetch(`/api/rooms/${roomId}/twenty-one`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentPlayerId,
          choice,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGameState(data.gameState)
        // Don't set myRoll here - currentRoll is the claimer's roll, not ours
        // The player hasn't rolled yet after accepting the 21 challenge
        setMyRoll(null)
      } else {
        setError(data.error || 'Failed to make choice')
      }
    } catch (err) {
      setError('Failed to make choice')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle play again
  const handlePlayAgain = async () => {
    try {
      const currentPlayerId = localStorage.getItem('playerId')
      const currentNickname = localStorage.getItem('nickname')

      const response = await fetch(`/api/rooms/${roomId}/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentPlayerId,
          nickname: currentNickname,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMyRoll(null)
        fetchState()
      } else {
        setError(data.error || 'Failed to restart')
      }
    } catch (err) {
      setError('Failed to restart')
    }
  }

  // Copy room code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId)
  }

  // Share link - copy to clipboard
  const handleShare = async () => {
    const url = `${window.location.origin}/?code=${roomId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle bluff vote
  const handleVote = async (vote: 'bluff' | 'truth' | null) => {
    const currentPlayerId = localStorage.getItem('playerId')
    if (!currentPlayerId) return

    try {
      await fetch(`/api/rooms/${roomId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentPlayerId, vote }),
      })
      // State will update via polling
    } catch (err) {
      console.error('Failed to submit vote:', err)
    }
  }

  // Debug output
  console.log('Render state:', {
    phase: gameState?.phase,
    needsToJoin,
    myGamePlayerId,
    currentTurnPlayerId: gameState?.currentTurnPlayerId,
    isMyTurn,
    playerCount: gameState?.players?.length
  })

  // Loading state
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  // Error state
  if (error && !gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-bluff-red mb-4">{error}</p>
        <button onClick={() => router.push('/')} className="btn-primary">
          Go Home
        </button>
      </div>
    )
  }

  // Needs to join
  if (needsToJoin && gameState.phase === 'lobby') {
    return (
      <div className="min-h-screen">
        <Header onHowToPlay={() => setShowRules(true)} />
        {showRules && <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />}
        <main className="max-w-md mx-auto p-4">
          <div className="game-panel">
            <h2 className="text-xl font-bold text-white mb-4 text-center">
              Join Game
            </h2>
            <p className="text-gray-400 text-center mb-4">
              Room: <span className="text-brand-blue font-mono">{roomId}</span>
            </p>

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Your Name</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className="w-full px-4 py-3 bg-panel-bg border border-gray-600 rounded-xl text-white"
                autoFocus
              />
            </div>

            {joinError && (
              <p className="text-bluff-red text-sm mb-4">{joinError}</p>
            )}

            <button
              onClick={handleJoin}
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Lobby
  if (gameState.phase === 'lobby') {
    return (
      <div className="min-h-screen">
        <Header onHowToPlay={() => setShowRules(true)} />
        {showRules && <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />}
        <main className="max-w-md mx-auto p-4">
          {/* Game Code Header - Prominent */}
          <div className="bg-gradient-to-r from-brand-blue/20 via-blue-500/20 to-cyan-500/20 border-2 border-brand-blue rounded-lg p-6 mb-6 backdrop-blur-sm">
            <div className="text-center">
              <span className="text-sm text-gray-400 uppercase tracking-wider">Game Code</span>
              <div className="text-5xl font-bold text-brand-blue mt-2 tracking-widest">{roomId.toUpperCase()}</div>
              <button
                onClick={handleShare}
                className={`mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${
                  copied
                    ? 'bg-truth-green text-white'
                    : 'bg-brand-blue text-white hover:bg-brand-blue/80'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Link Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>

              {/* Status message */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="text-gray-400 mb-4">
                  {gameState.players.length < 2 ? (
                    <p>Waiting for at least 2 players to start...</p>
                  ) : isHost ? (
                    <p>Ready to start!</p>
                  ) : (
                    <p>Waiting for host to start the game...</p>
                  )}
                </div>

                {isHost && (
                  <button
                    onClick={handleStartGame}
                    disabled={isLoading || gameState.players.length < 2}
                    className="w-full py-4 bg-brand-blue text-white font-bold rounded-lg text-lg hover:bg-brand-blue/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Starting...' : 'Start Game'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Lobby Panel */}
          <div className="bg-[#141414] border border-white/10 rounded-lg p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6 text-center">Game Lobby</h2>

            {error && (
              <div className="mb-4 rounded-lg bg-bluff-red/20 border border-bluff-red px-4 py-3 text-sm text-bluff-red">
                {error}
              </div>
            )}

            {/* Players List */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Players ({gameState.players.length}):</h3>
              <div className="space-y-2">
                {gameState.players.map((player) => (
                  <div
                    key={player.id}
                    className="bg-gray-900 border border-gray-700 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{player.name}</span>
                      {player.id === myGamePlayerId && (
                        <span className="text-xs text-gray-400">(You)</span>
                      )}
                    </div>
                    {player.isHost && (
                      <span className="text-xs bg-brand-blue px-2 py-1 rounded">Host</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Game Settings */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wider">Game Settings</h3>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                <span className="text-gray-300">Starting Tokens</span>
                <span className="text-2xl font-bold text-token-gold">{settings.startingTokens}</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Game is active
  const winner = gameState.phase === 'finished'
    ? gameState.players.find(p => !p.isEliminated)
    : null

  return (
    <div className="min-h-screen flex flex-col">
      <Header onHowToPlay={() => setShowRules(true)} />
      {showRules && <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />}

      <main className="flex-1 max-w-lg mx-auto w-full p-4 pb-16 flex flex-col overflow-hidden">
        {/* Compact Round Header */}
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div className="text-sm">
            <span className="text-gray-400">Round </span>
            <span className="text-white font-bold">{gameState.round}</span>
          </div>
          {gameState.isDoubleStakes && (
            <span className="text-xs bg-bluff-red/20 text-bluff-red px-2 py-1 rounded font-bold animate-pulse">
              DOUBLE STAKES
            </span>
          )}
        </div>

        {/* Action Panel - Status + buttons at top */}
        <div className="flex-shrink-0">
          <ActionPanel
            phase={gameState.phase}
            isMyTurn={isMyTurn && !myPlayer?.isEliminated}
            currentClaim={gameState.currentClaim}
            players={gameState.players}
            currentTurnPlayerId={gameState.currentTurnPlayerId}
            myPlayerId={myGamePlayerId || ''}
            myRoll={myRoll}
            isRolling={isRolling}
            rollId={rollId}
            onRoll={handleRoll}
            onCallBluff={handleCallBluff}
            onRollToBeat={handleRollToBeat}
            isLoading={isLoading}
            previousClaimerName={previousClaimer?.name}
          />
        </div>

        {/* Bluff Voting - Show during awaiting_response or awaiting_21_choice */}
        {(gameState.phase === 'awaiting_response' || gameState.phase === 'awaiting_21_choice') && gameState.currentClaim && (
          <BluffVoting
            players={gameState.players}
            myPlayerId={myGamePlayerId}
            previousClaimerId={gameState.previousClaimerId}
            votes={gameState.bluffVotes || {}}
            onVote={handleVote}
            disabled={isLoading}
          />
        )}

        {/* Claim List - Always visible, scrollable */}
        {/* Hide myRoll until animation finishes to preserve suspense, but allow claiming after hot reload */}
        <ClaimList
          currentClaim={gameState.currentClaim}
          previousClaimerName={previousClaimer?.name}
          myRoll={showRollResult ? myRoll : null}
          minimumClaim={gameState.minimumClaim}
          canSelectClaim={isMyTurn && gameState.phase === 'awaiting_claim' && !myPlayer?.isEliminated && (showRollResult || !isRolling)}
          onClaim={handleClaim}
          isLoading={isLoading}
          claimHistory={gameState.claimHistory || []}
        />

        {/* Error Display */}
        {error && (
          <div className="text-center text-bluff-red text-sm mt-2 flex-shrink-0">
            {error}
          </div>
        )}
      </main>

      {/* Modals / Overlays */}
      <TwentyOneModal
        isOpen={gameState.phase === 'awaiting_21_choice' && isMyTurn}
        claimerName={previousClaimer?.name || 'Someone'}
        onDoubleStakes={() => handleTwentyOneChoice('double_stakes')}
        onPass={() => handleTwentyOneChoice('pass')}
        isLoading={isLoading}
      />

      <ClaimAnnouncement
        claim={gameState.currentClaim}
        claimerName={previousClaimer?.name}
        isNewClaim={showClaimAnnouncement}
      />

      <BluffResolution
        resolution={(cachedResolution || gameState.lastResolution)!}
        players={gameState.players}
        isOpen={(gameState.phase === 'resolving_bluff' || gameState.phase === 'player_eliminated') && !!(cachedResolution || gameState.lastResolution)}
        myPlayerId={myGamePlayerId}
        claimerId={cachedResolution?.claimerId || gameState.lastResolution?.claimerId || null}
      />

      <GameOverScreen
        winner={winner || null}
        players={gameState.players}
        onPlayAgain={handlePlayAgain}
        isOpen={gameState.phase === 'finished'}
      />

      {/* Room Code Footer - shown during active gameplay */}
      {gameState.phase !== 'lobby' && gameState.phase !== 'finished' && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-800 py-2 px-4 safe-bottom z-30">
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs text-gray-500">Room:</span>
            <span className="text-sm font-mono font-bold text-brand-blue">{roomId.toUpperCase()}</span>
            <button
              onClick={() => {
                handleShare()
              }}
              className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded bg-gray-800 hover:bg-gray-700"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
