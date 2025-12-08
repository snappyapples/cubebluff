'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [tokens, setTokens] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Load saved nickname
  useEffect(() => {
    const savedNickname = localStorage.getItem('nickname')
    if (savedNickname) {
      setNickname(savedNickname)
    }
  }, [])

  const tokenOptions = [3, 5, 7, 10]

  const handleCreate = async () => {
    if (!nickname.trim()) {
      setError('Please enter your name')
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

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          nickname: nickname.trim(),
          startingTokens: tokens,
        }),
      })

      const data = await response.json()

      if (data.success && data.roomCode) {
        localStorage.setItem('activeRoomId', data.roomCode)
        router.push(`/room/${data.roomCode}`)
      } else {
        setError(data.error || 'Failed to create room')
      }
    } catch (err) {
      setError('Failed to create room. Please try again.')
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

        <h2 className="text-2xl font-bold text-white mb-6">Create a Room</h2>

        {/* Nickname Input */}
        <div className="mb-6">
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
            autoFocus
          />
        </div>

        {/* Token Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Starting Tokens
          </label>
          <div className="flex gap-2">
            {tokenOptions.map((t) => (
              <button
                key={t}
                onClick={() => setTokens(t)}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  tokens === t
                    ? 'bg-brand-blue text-white'
                    : 'bg-panel-bg text-gray-300 hover:bg-card-bg'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Players are eliminated when they lose all tokens
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-bluff-red text-sm mb-4">{error}</p>
        )}

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={isLoading}
          className="w-full btn-primary text-lg"
        >
          {isLoading ? 'Creating...' : 'Create Room'}
        </button>
      </div>
    </div>
  )
}
