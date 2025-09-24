import { defineConfig } from "tsup";

export default defineConfig([
  {
    // ⚠️ clés d'entry = chemins de sortie (garde DocClient en PascalCase)
    entry: {
      "src/DocClient": "src/DocClient.tsx",
      "src/ssr": "src/DocSSR.tsx",
      index: "src/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    target: "es2020",
    external: ["react", "react-dom", "next", "framer-motion"],
  },
]);
