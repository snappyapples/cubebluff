/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors (shared with Bank It theme)
        'primary': '#2b6cee',
        'background-light': '#f6f6f8',
        'background-dark': '#0a0a0a',
        'brand-purple': '#8B5CF6',
        'brand-teal': '#14B8A6',
        'brand-lime': '#A3E635',

        // Blue theme (primary brand colors)
        'brand-blue': '#3b82f6',
        'brand-blue-dark': '#2563eb',
        'brand-blue-light': '#60a5fa',

        // Game-specific colors
        'bluff-red': '#dc2626',      // For bluff calls
        'truth-green': '#16a34a',    // For successful defenses
        'token-gold': '#fbbf24',     // Token color
        'claim-blue': '#3b82f6',     // Claim display (same as brand-blue)

        // Panel backgrounds
        'game-bg': '#1f2937',
        'panel-bg': '#374151',
        'card-bg': '#4b5563',
      },
      fontFamily: {
        'display': ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '1.5rem',
        xl: '3rem',
        full: '9999px',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateX(-50%) translateY(10px)' },
          '20%': { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
          '80%': { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
          '100%': { opacity: '0', transform: 'translateX(-50%) translateY(-10px)' },
        },
        'pulse-danger': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(220, 38, 38, 0)' },
          '50%': { opacity: '0.9', boxShadow: '0 0 20px 10px rgba(220, 38, 38, 0.3)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(20px)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        'reveal': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'token-fall': {
          '0%': { transform: 'translateY(-20px)', opacity: '1' },
          '100%': { transform: 'translateY(100px)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 2.5s ease-out forwards',
        'pulse-danger': 'pulse-danger 1s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out forwards',
        'slide-out': 'slide-out 0.3s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
        'reveal': 'reveal 0.6s ease-out forwards',
        'bounce-in': 'bounce-in 0.4s ease-out forwards',
        'token-fall': 'token-fall 0.8s ease-in forwards',
        'fade-in': 'fade-in 0.15s ease-out forwards',
      },
    },
  },
  plugins: [],
}
