import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#f8f4ec",
        stone: "#f1e8db",
        accent: "#bf4f3b",
        sage: "#74806b",
        ink: "#2c2a28"
      },
      fontFamily: {
        serif: ["Iowan Old Style", "Palatino", "Times New Roman", "serif"],
        sans: ["Avenir Next", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        quiet: "0 12px 30px rgba(38,33,29,0.09)",
        halo: "0 0 0 1px rgba(255,255,255,0.6), 0 18px 40px rgba(55,48,42,0.10)"
      }
    }
  },
  plugins: []
};

export default config;
