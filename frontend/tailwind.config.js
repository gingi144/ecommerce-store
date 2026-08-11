/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'burnt-orange': '#CC5500',
        'burnt-orange-dark': '#8B3A00',
        'vanilla': '#F5E6D3',
        'vanilla-light': '#FFF8F0',
        'vanilla-dark': '#E8D5C0',
        'text-dark': '#2D1B0E',
        'text-medium': '#5C3D2A',
        'text-light': '#8B7355',
      },
    },
  },
  plugins: [],
}