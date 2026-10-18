/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FBF8F2', // Warm, luxurious linen pearl canvas from Figma
        surface: '#F7F0E7', // Soft champagne header background
        ink: '#2C1820', // High-contrast charcoal with warm plum undertone
        muted: '#7A6E65', // Refined warm taupe for SKU and secondary text
        border: {
          DEFAULT: '#E8DFD3',
          light: '#F0EAE1',
        },
        plum: {
          DEFAULT: '#42232D', // Deep royal wine for top announcement bar and footer
          dark: '#361B24',
          light: '#5A313E',
        },
        oxblood: {
          DEFAULT: '#68273D', // Artisanal berry/plum for primary CTA buttons, tabs, price highlights
          hover: '#541F31',
          light: '#7E314B',
        },
        gold: {
          DEFAULT: '#9B8469', // Elegant golden-bronze for tagline and warm accents
          light: '#B39B7E',
          dark: '#7D664E',
        },
        dark: '#42232B',
        primary: {
          50: '#FBF8F2',
          100: '#F7F0E7',
          200: '#E8DFD3',
          300: '#D5C4B4',
          400: '#B39B7E',
          500: '#9B8469',
          600: '#68273D',
          700: '#541F31',
          800: '#42232D',
          900: '#2C1820',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      screens: {
        xs: '420px',
      },
    },
  },
  plugins: [],
};
