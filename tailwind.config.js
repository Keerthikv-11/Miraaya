/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdfbf7', // Ivory
          100: '#f7f2ea', // Cream
          200: '#efe6d8', // Light beige
          300: '#e5d3bd', // Beige
          400: '#d9bda2', // Soft blush tone
          500: '#c59d7b', // Darker blush/gold
          600: '#b1805b',
          700: '#946345',
          800: '#7a523a',
          900: '#624431', // Dark brown
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
