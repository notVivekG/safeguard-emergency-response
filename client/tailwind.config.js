/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E53935', // red
          dark: '#B71C1C'
        },
        navy: {
          DEFAULT: '#0D1117',
          light: '#161B22'
        },
        amber: {
          DEFAULT: '#F59E0B'
        },
        safe: {
          DEFAULT: '#22C55E' // green
        },
        flood: {
          DEFAULT: '#3B82F6' // blue
        },
        background: {
          DEFAULT: '#F5F7FA',
          dark: '#010409'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
