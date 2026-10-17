/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FFFFFF', // Modern crisp luminous pearl white
        surface: '#F8FAFC',
        ink: '#0F172A', // Deep obsidian charcoal
        muted: '#64748B',
        oxblood: {
          DEFAULT: '#881337', // Royal Garnet / Ruby
          hover: '#700E2B',
          light: '#9F1239',
        },
        gold: {
          DEFAULT: '#D97706', // Polished Champagne Gold
          light: '#F59E0B',
          dark: '#B45309',
        },
        dark: '#0F172A',
        primary: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#881337',
          700: '#700E2B',
          800: '#4C0519',
          900: '#0F172A',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

