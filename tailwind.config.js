/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sunshine: '#f6c90e',
        ink: '#171717',
        warm: {
          50: '#faf8f2',
          100: '#f1ede2',
          200: '#ddd5c7',
          700: '#5d574f',
        },
      },
      boxShadow: {
        board: '0 14px 40px rgba(23, 23, 23, 0.12)',
      },
    },
  },
  plugins: [],
};
