import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        skinora: {
          hero: '#945b3a',         // Warm Terracotta Hero background[cite: 1]
          heroDark: '#7e4b2d',
          bgLight: '#fcf8f5',      // Soft off-white canvas[cite: 1]
          cream: '#ede2d8',        // Neutral sand section background[cite: 1]
          creamDark: '#e3d4c6',
          panel: '#935c3c',        // Upgrade & Footer panel brown tone[cite: 1]
          panelDark: '#7c4b2e',
          accent: '#b27b58',       // Active pill / badge accent color[cite: 1]
          dark: '#1c1512',         // Deep body text[cite: 1]
          muted: '#726157',        // Subtle body text[cite: 1]
          card: '#f9f6f1',         // Clean product card background[cite: 1]
          line: '#e6dad0',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(160deg, #9f6340 0%, #945b3a 50%, #7d492c 100%)',
      },
      boxShadow: {
        soft: '0 10px 30px -10px rgba(60, 35, 20, 0.12)',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.no-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
      });
    }),
  ],
};