/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // User design tokens
        primary: '#27272A',
        secondary: '#FAFAFA',
        accent: {
          DEFAULT: '#84CC16',
          hover: '#65A30D',
          light: '#A3E635',
          dark: '#4D7C0F'
        },
        canvas: '#F4F4F5',
        surface: '#FFFFFF',
        'text-main': '#18181B',
        'border-main': '#E4E4E7',
        graphite: {
          50: '#F4F4F5',
          100: '#E4E4E7',
          200: '#D4D4D8',
          300: '#A1A1AA',
          400: '#71717A',
          500: '#52525B',
          600: '#3F3F46',
          700: '#27272A',
          800: '#18181B',
          900: '#09090B'
        },
        lime: {
          50: '#F7FEE7',
          100: '#ECFCCB',
          200: '#D9F99D',
          300: '#BEF264',
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
          700: '#4D7C0F',
          800: '#3F6212',
          900: '#365314'
        }
      }
    },
  },
  plugins: [],
}
