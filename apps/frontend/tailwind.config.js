/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'apps/frontend/pages/**/*.tsx',
    'apps/frontend/components/**/*.tsx',
    /** The following is used during build time. */
    './pages/**/*.tsx',
    './components/**/*.tsx',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
};
