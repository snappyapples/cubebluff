'use client'

import Link from 'next/link'

interface HeaderProps {
  showLogo?: boolean
  onHowToPlay?: () => void
}

export default function Header({ showLogo = true, onHowToPlay }: HeaderProps) {
  return (
    <header className="w-full py-4 px-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {showLogo ? (
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex gap-1 text-2xl">
              🎲
            </div>
            <span className="text-2xl font-bold text-white">
              Cube <span className="text-brand-blue">Bluff</span>
            </span>
          </Link>
        ) : (
          <div />
        )}

        {onHowToPlay && (
          <button
            onClick={onHowToPlay}
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to Play
          </button>
        )}
      </div>
    </header>
  )
}
