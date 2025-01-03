/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Open Sans', 'Oswald', 'Nunito', 'Bebas Neue', 'Mulish', 'sans-serif'],
      },
    },
  },
  plugins: [],
}