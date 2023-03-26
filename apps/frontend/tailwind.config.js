/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'apps/frontend/pages/**/*.tsx',
    'apps/frontend/components/**/*.tsx',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
};
