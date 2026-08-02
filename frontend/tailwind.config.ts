/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'glass-dark': 'rgba(15, 23, 42, 0.8)',
        'glass-light': 'rgba(30, 41, 59, 0.6)',
        'accent-cyan': '#06B6D4',
        'accent-blue': '#0EA5E9',
        'accent-teal': '#14B8A6',
      },
      backdropFilter: {
        'glass': 'backdrop-blur(10px)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
    },
  },
  plugins: [],
};