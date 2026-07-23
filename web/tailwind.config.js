/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        surface: "#141414",
        border: "#1f1f1f",
        "border-hover": "#2a2a2a",
        text: "#fafafa",
        "text-muted": "#a3a3a3",
        "text-faded": "#525252",
        lime: {
          DEFAULT: "#c4ff3e",
          dim: "#9bcc2f",
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      fontFamily: {
  body: ["var(--font-geist-sans)", "sans-serif"],
  display: ["var(--font-display)", "sans-serif"],
  mono: ["var(--font-mono)", "monospace"],
},
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};