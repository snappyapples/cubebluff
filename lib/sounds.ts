'use client'

// Sound effects for Cube Bluff
interface GameSounds {
  roll: string
  claim: string
  bluffCall: string
  bluffSuccess: string
  bluffFail: string
  twentyOne: string
  elimination: string[]  // Array for random selection
  victory: string
  tokenLost: string
}

// Free sound URLs from various royalty-free sources
// TODO: Replace with your own hosted sounds for production
const SOUNDS: GameSounds = {
  roll: 'https://soundbible.com/grab.php?id=182&type=mp3',  // Dice shake
  claim: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',  // Chip slide
  bluffCall: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',  // Dramatic sting
  bluffSuccess: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',  // Success
  bluffFail: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3',  // Fail
  twentyOne: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',  // Jackpot
  elimination: [
    'https://assets.mixkit.co/active_storage/sfx/470/470-preview.mp3',   // Sad trombone
    'https://assets.mixkit.co/active_storage/sfx/2953/2953-preview.mp3', // Wrong answer
  ],
  victory: '/sounds/victory.mp3',  // Host locally
  tokenLost: 'https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3',  // Coin drop
}

export type SoundEffect = keyof GameSounds

// Audio element pool for playing multiple sounds simultaneously
const audioPool: Map<string, HTMLAudioElement[]> = new Map()

// Get or create an available audio element for a URL
function getAudioElement(url: string, volume: number): HTMLAudioElement {
  let pool = audioPool.get(url)
  if (!pool) {
    pool = []
    audioPool.set(url, pool)
  }

  // Find an available (not playing) element
  for (const audio of pool) {
    if (audio.paused || audio.ended) {
      audio.currentTime = 0
      audio.volume = volume
      return audio
    }
  }

  // Create new element if none available (limit pool size)
  if (pool.length < 5) {
    const audio = new Audio(url)
    audio.volume = volume
    pool.push(audio)
    return audio
  }

  // Reuse oldest if pool is full
  const audio = pool[0]
  audio.currentTime = 0
  audio.volume = volume
  return audio
}

// Play a sound using HTMLAudioElement
function playAudioElement(url: string, volume: number): void {
  if (typeof window === 'undefined') return

  try {
    const audio = getAudioElement(url, volume)
    audio.play().catch(() => {
      // Ignore autoplay failures
    })
  } catch (e) {
    // Ignore errors
  }
}

class SoundManager {
  private enabled: boolean = true
  private volume: number = 0.5
  private initialized: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soundEnabled')
      this.enabled = saved !== 'false'
      const savedVol = localStorage.getItem('soundVolume')
      if (savedVol) this.volume = parseFloat(savedVol)
    }
  }

  // Call this on first user interaction to unlock audio on iOS
  unlock(): void {
    if (this.initialized) return
    this.initialized = true

    // Pre-load common sounds by creating Audio elements
    getAudioElement(SOUNDS.roll, this.volume)
    getAudioElement(SOUNDS.claim, this.volume)
    getAudioElement(SOUNDS.bluffCall, this.volume)
  }

  play(effect: SoundEffect): void {
    if (!this.enabled) return
    if (typeof window === 'undefined') return

    this.unlock()

    try {
      let url: string

      if (effect === 'elimination') {
        // Random elimination sound from array
        url = SOUNDS.elimination[Math.floor(Math.random() * SOUNDS.elimination.length)]
      } else {
        url = SOUNDS[effect]
      }

      if (!url) return

      playAudioElement(url, this.volume)
    } catch (e) {
      // Ignore errors
    }
  }

  stop(effect: SoundEffect): void {
    if (typeof window === 'undefined') return

    try {
      let url: string

      if (effect === 'elimination') {
        SOUNDS.elimination.forEach(elimUrl => {
          const pool = audioPool.get(elimUrl)
          if (pool) {
            pool.forEach(audio => {
              audio.pause()
              audio.currentTime = 0
            })
          }
        })
        return
      } else {
        url = SOUNDS[effect]
      }

      if (!url) return

      const pool = audioPool.get(url)
      if (pool) {
        pool.forEach(audio => {
          audio.pause()
          audio.currentTime = 0
        })
      }
    } catch (e) {
      // Ignore errors
    }
  }

  toggle(): boolean {
    this.enabled = !this.enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', String(this.enabled))
    }
    return this.enabled
  }

  isEnabled(): boolean {
    return this.enabled
  }

  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol))
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundVolume', String(this.volume))
    }
  }

  getVolume(): number {
    return this.volume
  }
}

// Singleton instance
export const soundManager = new SoundManager()

export function preloadSounds(): void {
  soundManager.unlock()
}

export function playSound(effect: SoundEffect): void {
  soundManager.play(effect)
}
