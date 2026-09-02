/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5", // Indigo - buttons, accents
          dark: "#4338CA",
          light: "#818CF8",
        },
        secondary: {
          DEFAULT: "#06B6D4", // Cyan - AI feature highlights
          dark: "#0891B2",
          light: "#67E8F9",
        },
        bgLight: "#F9FAFB",
        textDark: "#111827",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
