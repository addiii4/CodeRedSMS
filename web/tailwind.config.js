/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Match mobile/src/constants/color.ts exactly
        primary: '#B00020',
        'primary-hover': '#8C0019',
        ink: '#121212',
        muted: '#8e8e93',
        line: '#D6D6D6',
        bg: '#FAFAFA',
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto',
          '"Helvetica Neue"', 'Arial', 'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
