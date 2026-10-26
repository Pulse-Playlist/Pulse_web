import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Outfit", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#C4FF00", // Neon Lime Green
          neon: "#C4FF00",
          hover: "#B8F500",
          black: "#0A0A0A",
          obsidian: "#000000",
          dark: "#0B0B0E",
          cardDark: "#141418",
          cardLight: "#FFFFFF",
          borderDark: "#222228",
          borderLight: "#E5E7EB",
          blue: "#0044FF",
          red: "#FF4B4B",
        },
      },
      keyframes: {
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-6px)" },
          "40%, 80%": { transform: "translateX(6px)" },
        },
        pulseGlow: {
          "0%, 100%": {
            boxShadow: "0 0 15px 2px rgba(196, 255, 0, 0.4)",
          },
          "50%": {
            boxShadow: "0 0 35px 8px rgba(196, 255, 0, 0.8)",
          },
        },
      },
      animation: {
        ripple: "ripple 0.6s cubic-bezier(0, 0.2, 0.8, 1) forwards",
        shake: "shake 0.4s ease-in-out",
        "pulse-glow": "pulseGlow 1.5s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
