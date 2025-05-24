/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'arabic': ['Traditional Arabic', 'serif'],
      },
      backdropBlur: {
        'sm': '4px',
      },
      colors: {
        dark: {
          50: '#1a1a1a',
          100: '#2d2d2d',
          200: '#3d3d3d',
          300: '#4d4d4d',
          400: '#5d5d5d',
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
} 