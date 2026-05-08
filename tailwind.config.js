/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: { blue: '#00f0ff', purple: '#b026ff', dark: '#0a0a0f', panel: 'rgba(255, 255, 255, 0.05)' }
      }
    },
  },
  plugins: [],
}
