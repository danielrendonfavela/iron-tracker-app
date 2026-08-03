/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        iron: {
          950: '#09090b',
          900: '#121215',
          800: '#1e1e24',
          700: '#2a2a32',
          red: '#dc2626',
          crimson: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
