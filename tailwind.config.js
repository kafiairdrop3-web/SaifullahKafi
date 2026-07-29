/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#151313",
        accent: "#ff5734",
        purple: {
          light: "#d5bcfa",
          DEFAULT: "#be9af5",
          dark: "#a376e8",
        },
        yellow: {
          DEFAULT: "#fccc42",
          light: "#fee592",
        },
        offwhite: "#f7f7f5",
      },
      fontFamily: {
        sans: ['Kodchasan', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 8px 24px -4px rgba(21, 19, 19, 0.08), 0 4px 12px -2px rgba(21, 19, 19, 0.04)',
        'card-hover': '0 16px 32px -4px rgba(21, 19, 19, 0.12), 0 8px 16px -2px rgba(21, 19, 19, 0.06)',
        'pill': '0 2px 8px -1px rgba(21, 19, 19, 0.08)',
      }
    },
  },
  plugins: [],
}
