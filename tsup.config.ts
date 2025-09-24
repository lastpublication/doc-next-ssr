import { defineConfig } from "tsup";

export default defineConfig([
  // build des sources pour produire dist/src/*.d.ts
  {
    entry: {
      "src/client": "src/DocClient.tsx",
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
  // wrappers (optionnel si tu les génères en postbuild)
  // ou garde ton script postbuild qui écrit dist/client/index.(mjs|cjs) avec "use client"
]);
