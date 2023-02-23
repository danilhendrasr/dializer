/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'apps/frontend-next/pages/**/*.tsx',
    'apps/frontend-next/components/**/*.tsx',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
