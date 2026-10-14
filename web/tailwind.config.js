/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#FBF6EE',
          light: '#FFFDF9',
          dark: '#F3EAD8',
        },
        gold: {
          50: '#FAF6EE',
          100: '#F4EBD9',
          200: '#E9D5B3',
          300: '#DCBE8A',
          400: '#CCA460',
          500: '#B8893B', // Muted gold brand accent
          600: '#9C702D',
          700: '#7E5624',
          800: '#644420',
          900: '#52371D',
        },
        primary: {
          50: '#fdf4f5',
          100: '#fbe8eb',
          200: '#f7d5da',
          300: '#f0b5bf',
          400: '#e58a9b',
          500: '#d75f76',
          600: '#c0405a', // Crimson brand accent
          700: '#a13148',
          800: '#872c3f',
          900: '#732938',
        },
      },
    },
  },
  plugins: [],
}
