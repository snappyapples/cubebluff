'use client'

import { useEffect, useState, useRef } from 'react'
import { Roll, isTwentyOne, isDouble } from '@/lib/types'

interface ClaimAnnouncementProps {
  claim: Roll | null
  claimerName: string | undefined
  isNewClaim: boolean // Trigger when this changes to true
}

export default function ClaimAnnouncement({ claim, claimerName, isNewClaim }: ClaimAnnouncementProps) {
  const [show, setShow] = useState(false)
  const lastClaimRef = useRef<string | null>(null)

  useEffect(() => {
    // Only show when there's a new claim
    if (isNewClaim && claim && claim.display !== lastClaimRef.current) {
      lastClaimRef.current = claim.display
      setShow(true)

      // Auto-hide after 2.5 seconds
      const timer = setTimeout(() => {
        setShow(false)
      }, 2500)

      return () => clearTimeout(timer)
    }
  }, [isNewClaim, claim?.display])

  // Reset when claim is cleared
  useEffect(() => {
    if (!claim) {
      lastClaimRef.current = null
    }
  }, [claim])

  if (!show || !claim) return null

  const is21 = isTwentyOne(claim)
  const isDoubleRoll = isDouble(claim)

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none">
      <div className="bg-gray-900/95 backdrop-blur-sm border-2 border-brand-blue rounded-2xl p-8 animate-bounce-in shadow-2xl max-w-sm w-full">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-3">
            <span className="font-semibold text-white">{claimerName}</span> claims
          </p>
          <p className={`text-7xl font-bold font-mono mb-2 ${
            is21 ? 'text-truth-green' : isDoubleRoll ? 'text-token-gold' : 'text-brand-blue'
          }`}>
            {claim.display}
          </p>
          {is21 && (
            <p className="text-truth-green text-sm font-medium mt-2">
              Special 21!
            </p>
          )}
          {isDoubleRoll && !is21 && (
            <p className="text-token-gold text-sm font-medium mt-2">
              Doubles!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
