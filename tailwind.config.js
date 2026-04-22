/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00938e',
          light: '#00b5af',
          dark: '#007a76',
          50:  '#e6f7f7',
          100: '#ccefee',
          200: '#99dfdd',
          300: '#66cfcc',
          400: '#33bfbb',
          500: '#00938e',
          600: '#007a76',
          700: '#00605d',
          800: '#004745',
          900: '#002e2c',
        },
      },
    },
  },
  plugins: [],
}