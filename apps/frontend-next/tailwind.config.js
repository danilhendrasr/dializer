/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'apps/frontend-next/pages/**/*.tsx',
    'apps/frontend-next/components/**/*.tsx',
  ],
  theme: {
    colors: {
      primary1: '#ffffff',
      primary2: '#e5e5e5',
      secondary: '#fca311',
      accent1: '#14213d',
      accent2: '#000000',
    },
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
