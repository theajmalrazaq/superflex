/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        x: "#FF2E00",
        dark: "#000000",
        secondary: "#212121",
      },
      fontFamily: {
        sans: ["Product Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
