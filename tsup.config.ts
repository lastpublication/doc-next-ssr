// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig([
  // Build CLIENT: injecte "use client"
  {
    entry: { "components/DocClient": "src/DocClient.tsx" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    target: "es2020",
    external: ["react", "react-dom", "next", "framer-motion"],
    banner: { js: '"use client";' }, // 👈 ligne 1 assurée
  },
  // Build SSR + index (pas de "use client")
  {
    entry: {
      "components/DocSSR": "src/DocSSR.tsx",
      index: "src/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    target: "es2020",
    external: ["react", "react-dom", "next", "framer-motion"],
  },
]);
