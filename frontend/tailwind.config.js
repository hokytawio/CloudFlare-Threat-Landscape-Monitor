/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        desktop: "#008080", // teal clássico do desktop Windows 98
        silver: "#C0C0C0", // cinzento das janelas
        silverDark: "#808080",
        navy: "#000080", // barra de título ativa
        navyLight: "#1084D0",
        maroon: "#800000",
        crtGreen: "#33FF33", // radar CRT fosforescente
        crtGreenDim: "#1A8A1A",
      },
      fontFamily: {
        win: ["'Pixelated MS Sans Serif'", "Tahoma", "Arial", "sans-serif"],
        mono: ["'Courier New'", "monospace"],
      },
    },
  },
  plugins: [],
};
