/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B1437',
          paper: '#111C44',
          light: '#1A1F37',
        },
        primary: {
          main: '#4318FF',
          dark: '#3311DB',
          light: '#6A4FFF',
        },
        secondary: {
          main: '#0F1535',
          hover: '#2B3674',
        },
        success: {
          main: '#01B574',
          light: '#32CD32',
        },
        info: {
          main: '#3965FF',
          light: '#3965FF80',
        },
        warning: {
          main: '#FFB547',
          light: '#FFB54780',
        },
        error: {
          main: '#FF5B5B',
          light: '#FF5B5B80',
        },
        gray: {
          100: '#FFFFFF80',
          200: '#FFFFFF40',
          300: '#FFFFFF30',
          400: '#FFFFFF20',
          500: '#FFFFFF10',
          600: '#FFFFFF08',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
} 