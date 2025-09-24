import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"], // ESM d’abord (meilleur tree-shake), CJS pour compat
  dts: true, // génère index.d.ts
  sourcemap: true,
  clean: true,
  splitting: false, // ok pour une lib (sinon gère les chunks)
  treeshake: true, // 👉 utile pour réduire la taille
  minify: false, // laisse false en dev; tu peux activer en prod
  target: "es2020", // cible moderne
  external: [
    "react",
    "react-dom",
    "next",
    "framer-motion", // évite de bundler FM (préviens les doubles React)
  ],
});
