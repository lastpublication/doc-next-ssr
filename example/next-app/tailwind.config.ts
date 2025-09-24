import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../src/**/*.{ts,tsx}",
    "./node_modules/@todo/doc-next-ssr/dist/**/*.{js,ts}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class", // Correction pour activer le mode sombre basé sur la classe
  plugins: [typography],
};

export default config;
