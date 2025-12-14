/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- VOTRE NOUVELLE CHARTE ---
        
        // 1. LE FOND (Blanc Crème #FFFFFB)
        // On remplace le 'gray-50' standard par votre crème pour que tout le site change d'un coup.
        gray: {
          50: '#FFFFFB',  // Fond principal
          100: '#F5F5F0', // Fond secondaire léger
          200: '#EBEBE0', // Bordures
          800: '#1F2937', // Texte sombre standard
          900: '#111827', // Titres noirs
        },

        // 2. LA COULEUR PRINCIPALE (Bleu Pétrole #094357)
        // On génère une palette autour de votre couleur pour les dégradés et survols.
        primary: {
          50: '#F0F7FA', // Très clair (fonds icones)
          100: '#E0F0F5',
          200: '#B8E0EB',
          300: '#8ACCD9',
          400: '#52A8BC',
          500: '#2E8B9F',
          600: '#1D6F82', // Boutons (Un peu plus clair que le logo pour le contraste)
          700: '#13586B', // Survol boutons
          800: '#0E4D5E',
          900: '#094357', // VOTRE COULEUR (Navbars, Footer, Sidebar)
          950: '#052A38', // Très sombre
        },

        // 3. L'ACCENT (Beige Doré #E6AA76)
        gold: {
          50: '#FDF8F3',
          100: '#FBEFE6',
          200: '#F6DCC8',
          300: '#F0C6A6',
          400: '#EBB689',
          500: '#E6AA76', // VOTRE COULEUR (Boutons d'action, Icones)
          600: '#D99256', // Survol
          700: '#B5723C',
          800: '#925933',
          900: '#76482C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}