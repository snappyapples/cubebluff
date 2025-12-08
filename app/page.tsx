'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import CreateRoomModal from '@/components/CreateRoomModal'
import JoinRoomModal from '@/components/JoinRoomModal'
import RulesModal from '@/components/RulesModal'

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [initialCode, setInitialCode] = useState('')
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)

  // Check for active room to show rejoin button
  useEffect(() => {
    const storedRoomId = localStorage.getItem('activeRoomId')
    if (storedRoomId) {
      // Verify the room still exists
      fetch(`/api/rooms/${storedRoomId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.gameState?.phase !== 'finished') {
            setActiveRoomId(storedRoomId)
          } else {
            // Room no longer exists or game finished - clear it
            localStorage.removeItem('activeRoomId')
          }
        })
        .catch(() => {
          localStorage.removeItem('activeRoomId')
        })
    }
  }, [])

  // Check for ?code= param to auto-open join modal
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      setInitialCode(code.toUpperCase())
      setShowJoin(true)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen">
      <Header onHowToPlay={() => setShowRules(true)} />
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-brand-blue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-32 h-32 bg-brand-blue-dark/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-token-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          {/* Dice Icons */}
          <div className="flex justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg transform -rotate-6 hover:rotate-0 transition-transform">
              <div className="grid grid-cols-2 gap-1 p-2">
                <div className="w-3 h-3 bg-white rounded-full" />
                <div className="w-3 h-3 bg-white rounded-full" />
                <div className="w-3 h-3 bg-white rounded-full" />
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
            <div className="w-16 h-16 bg-brand-blue-dark rounded-xl flex items-center justify-center shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
              <div className="grid grid-cols-2 gap-1 p-2">
                <div className="w-3 h-3 bg-white rounded-full" />
                <div className="w-3 h-3 bg-transparent" />
                <div className="w-3 h-3 bg-transparent" />
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-2">
            Cube <span className="text-brand-blue">Bluff</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Roll. Claim. Bluff. Survive.
          </p>
        </div>

        {/* Rejoin Active Game Banner */}
        {activeRoomId && (
          <div className="w-full mb-4">
            <button
              onClick={() => router.push(`/room/${activeRoomId}`)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-brand-blue/20 border-2 border-brand-blue rounded-xl text-brand-blue font-bold text-lg hover:bg-brand-blue/30 transition-all"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Rejoin Game ({activeRoomId.toUpperCase()})
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-4 mb-8">
          <button
            onClick={() => setShowCreate(true)}
            className="w-full btn-primary text-lg py-4"
          >
            Create Room
          </button>

          <button
            onClick={() => {
              setInitialCode('')
              setShowJoin(true)
            }}
            className="w-full btn-secondary text-lg py-4"
          >
            Join Room
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>A multiplayer bluffing dice game</p>
        </div>
      </div>

      {/* Modals */}
      <CreateRoomModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <JoinRoomModal isOpen={showJoin} onClose={() => setShowJoin(false)} initialCode={initialCode} />
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  )
}
