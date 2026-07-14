/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: "#0f172a",        // full background
        bgSidebar: "#111827",     // sidebar
        bgChat: "#020617",        // chat area
        bgSurface: "#1e293b",     // cards/input
        bgInput: "#1e293b",       // input background (alias)
        bgHover: "#263348",       // hover state
        primary: "#6366f1",       // purple accent
        textMain: "#e2e8f0",
        textSub: "#94a3b8",
      }
    },
  },
  plugins: [],
}

