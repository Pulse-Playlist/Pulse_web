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
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          accent: "#06b6d4",
          neon: "#22c55e",
        },
        cadence: {
          recovery: "#38bdf8", // <130 Blue
          aerobic: "#34d399",  // 130-149 Emerald
          jog: "#a3e635",      // 150-164 Lime
          marathon: "#f59e0b", // 165-179 Amber
          sprint: "#f43f5e",   // 180+ Rose
        },
      },
      keyframes: {
        beatPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.4" },
          "50%": { transform: "scale(1.35)", opacity: "1", filter: "drop-shadow(0 0 12px rgba(34, 197, 94, 0.9))" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "15%": { transform: "scale(1.2)" },
          "30%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.15)" },
        },
      },
      animation: {
        "beat-pulse": "beatPulse 0.3s ease-out",
        "heartbeat": "heartbeat 1.2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
