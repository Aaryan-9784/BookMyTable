/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        luxury: {
          bg:      '#0b0b0c',
          surface: '#131313',
          card:    '#181818',
          border:  '#252525',
          muted:   '#7a7a7a',
          mutedlt: '#b8b8b8',
          white:   '#f0f0f0',
          gold:    '#d4af37',
          golddim: '#a8892a',
          goldlt:  '#e8c84a',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sidebar': '4px 0 40px rgba(0,0,0,0.5)',
        'card':    '0 4px 40px rgba(0,0,0,0.5)',
        'gold-sm': '0 0 20px rgba(212,175,55,0.10)',
        'gold-md': '0 0 40px rgba(212,175,55,0.16)',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'    },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
      },
    },
  },
  plugins: [],
};
