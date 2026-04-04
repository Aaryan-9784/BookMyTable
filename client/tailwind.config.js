/** @type {import('tailwindcss').Config} */
/**
 * Luxury dark + gold palette — matches product brief (#0f0f0f / #d4af37).
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        luxury: {
          bg: '#0f0f0f',
          surface: '#1a1a1a',
          border: '#2a2a2a',
          muted: '#a3a3a3',
          gold: '#d4af37',
          golddim: '#b8962e',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 40px rgba(212, 175, 55, 0.12)',
      },
    },
  },
  plugins: [],
};
