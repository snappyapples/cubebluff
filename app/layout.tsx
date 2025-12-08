import type { Metadata, Viewport } from 'next'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'Cube Bluff - Online Multiplayer Dice Game',
  description: 'A multiplayer bluffing dice game. Roll secretly, make claims, and catch your friends lying!',
  keywords: ['dice game', 'multiplayer', 'bluffing', 'online game', 'party game'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cube Bluff',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-display bg-background-dark text-gray-100 min-h-screen">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
