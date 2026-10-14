/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4f5',
          100: '#fbe8eb',
          200: '#f7d5da',
          300: '#f0b5bf',
          400: '#e58a9b',
          500: '#d75f76',
          600: '#c0405a',
          700: '#a13148',
          800: '#872c3f',
          900: '#732938',
        },
      },
    },
  },
  plugins: [],
}
