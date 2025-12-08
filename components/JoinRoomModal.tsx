'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface JoinRoomModalProps {
  isOpen: boolean
  onClose: () => void
  initialCode?: string
}

export default function JoinRoomModal({ isOpen, onClose, initialCode = '' }: JoinRoomModalProps) {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [roomCode, setRoomCode] = useState(initialCode)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Load saved nickname
  useEffect(() => {
    const savedNickname = localStorage.getItem('nickname')
    if (savedNickname) {
      setNickname(savedNickname)
    }
  }, [])

  // Update room code when initialCode changes
  useEffect(() => {
    if (initialCode) {
      setRoomCode(initialCode)
    }
  }, [initialCode])

  const handleJoin = async () => {
    if (!nickname.trim()) {
      setError('Please enter your name')
      return
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Generate or get player ID
      let playerId = localStorage.getItem('playerId')
      if (!playerId) {
        playerId = crypto.randomUUID()
        localStorage.setItem('playerId', playerId)
      }
      localStorage.setItem('nickname', nickname.trim())

      const response = await fetch(`/api/rooms/${roomCode.toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          nickname: nickname.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('activeRoomId', roomCode.toUpperCase())
        router.push(`/room/${roomCode.toUpperCase()}`)
      } else {
        setError(data.error || 'Failed to join room')
      }
    } catch (err) {
      setError('Failed to join room. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-game-bg rounded-2xl p-6 w-full max-w-md animate-slide-in shadow-2xl border border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Join a Room</h2>

        {/* Nickname Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            className="w-full px-4 py-3 bg-panel-bg border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            autoFocus={!initialCode}
          />
        </div>

        {/* Room Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Room Code
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-letter code"
            maxLength={6}
            className="w-full px-4 py-3 bg-panel-bg border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue uppercase tracking-widest text-center text-xl font-mono"
            autoFocus={!!initialCode}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-bluff-red text-sm mb-4">{error}</p>
        )}

        {/* Join Button */}
        <button
          onClick={handleJoin}
          disabled={isLoading}
          className="w-full btn-primary text-lg"
        >
          {isLoading ? 'Joining...' : 'Join Room'}
        </button>
      </div>
    </div>
  )
}
