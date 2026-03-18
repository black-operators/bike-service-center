/** @type {import('tailwindcss').Config} */ 
module.exports = { 
  content: [ 
    "./src/**/*.{js,jsx,ts,tsx}", 
  ], 
  theme: { 
    extend: {
      colors: {
        ev: {
          dark: '#0f172a',
          card: '#1e293b',
          primary: '#3b82f6',
          accent: '#06b6d4',
          success: '#10b981',
          muted: '#94a3b8'
        }
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      }
    }, 
  }, 
  plugins: [], 
} 

