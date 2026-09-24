// tailwind.config.js
import plugin from 'tailwindcss/plugin';

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
        apoteca: {
          cream: '#FDFBF7',      // Vrai Crème / Off-white (fond principal)
          charcoal: '#2D2D2A',   // Noir Charbon (titres et textes)
          pink: '#C88880',       // Vieux Rose / Warm Pink (boutons et accents)
          grey: '#CECECE',       // Gris doux (bordures)
          beige: '#E8E5DF',      // Beige clair (fond des cartes et badges)
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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