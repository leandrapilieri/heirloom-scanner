import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Olive-inspired palette
        ivory: "#f9f8f5",
        stone: "#f0ebe5",
        accent: "#6b9e7f", // Sage green (primary)
        "accent-warm": "#d4a574", // Warm terracotta/gold
        sage: "#6b9e7f", // Sage green
        ink: "#2c2c2c", // Near-black
        "ink-light": "#6b6b6b", // Soft gray
      },
      fontFamily: {
        serif: ["Sora", "DM Sans", "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        quiet: "0 8px 24px rgba(0, 0, 0, 0.06)",
        halo: "0 0 0 1px rgba(107, 158, 127, 0.2), 0 12px 32px rgba(0, 0, 0, 0.08)",
        "soft": "0 4px 16px rgba(0, 0, 0, 0.04)",
        "premium": "0 20px 40px rgba(0, 0, 0, 0.08)"
      },
      backdropBlur: {
        xs: "2px",
      }
    }
  },
  plugins: []
};

export default config;
