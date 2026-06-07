/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#D32F2F',         // Code Red brand red
        'primary-hover': '#B71C1C',
        ink: '#1c1c1e',
        muted: '#8e8e93',
        line: '#e5e5ea',
        bg: '#f5f5f7',
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
