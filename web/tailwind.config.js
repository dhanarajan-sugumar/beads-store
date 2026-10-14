/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF5EC',
        ink: '#2B2623',
        muted: '#7A7068',
        oxblood: {
          DEFAULT: '#6B1F2A',
          hover: '#541821',
          light: '#852A37',
        },
        gold: {
          DEFAULT: '#B08D57',
          light: '#C7A775',
          dark: '#967443',
        },
        dark: '#231F1D',
        primary: {
          50: '#FAF5EC',
          100: '#F4E8EA',
          200: '#E6C6CC',
          300: '#D29AA5',
          400: '#B46575',
          500: '#8A3241',
          600: '#6B1F2A', // Oxblood accent
          700: '#541821',
          800: '#3D1118',
          900: '#231F1D',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

