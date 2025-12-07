'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import CreateRoomModal from '@/components/CreateRoomModal'
import JoinRoomModal from '@/components/JoinRoomModal'
import RulesModal from '@/components/RulesModal'

function HomeContent() {
  const searchParams = useSearchParams()
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [initialCode, setInitialCode] = useState('')

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
