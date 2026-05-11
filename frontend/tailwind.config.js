/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 8px 30px rgba(72, 94, 255, 0.25)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        typing: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        typing: 'typing 1.2s steps(4, end) infinite',
      },
    },
  },
  plugins: [],
};
