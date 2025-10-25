/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",      // Added src/
    "./src/pages/**/*.{js,ts,jsx,tsx}",    // Added src/
    "./src/components/**/*.{js,ts,jsx,tsx}", // Added src/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}