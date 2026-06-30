import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FBFAF7",
        ink: "#15211D",
        brand: {
          DEFAULT: "#0E6B5C",
          dark: "#0A5145",
          light: "#E8F0ED",
        },
        coral: {
          DEFAULT: "#FF6B4A",
          dark: "#E85232",
        },
        sun: "#FFC24B",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
