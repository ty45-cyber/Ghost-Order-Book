import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: "#070a0f",
          900: "#0b0e14",
          850: "#0f141d",
          800: "#141c2b",
          700: "#1e293b",
          border: "#1f2d42",
          accent: "#2e3f59",
        },
        ghost: {
          cyan: "#00f2fe",
          green: "#10b981",
          red: "#ef4444",
          amber: "#f59e0b",
        },
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;