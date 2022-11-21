/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: ({ colors }) => ({
      transparent: colors.transparent,
      black: "#000000",
      white: "#FFFFFF",
      gray: {
        text: "#666666",
        border: "#222222",
        background: "#101010",
      },
      danger: "RED",
      warning: "#F5A623",
      success: "#0070F3",
    }),
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwindcss-radix")()],
};
