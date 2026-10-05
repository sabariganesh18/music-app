/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          dark: '#121212',
          base: '#181818',
          card: '#1e1e1e',
          hover: '#282828',
          accent: '#1db954',
          accentHover: '#1ed760',
          subtext: '#b3b3b3',
          border: '#2a2a2a',
          divider: '#333333'
        }
      },
      fontFamily: {
        sans: ['Circular', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'player': '0 -4px 20px rgba(0, 0, 0, 0.6)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
