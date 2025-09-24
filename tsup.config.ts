import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { client: "src/DocClient.entry.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    target: "es2020",
    external: ["react", "react-dom", "next", "framer-motion"],
  },
  {
    entry: { ssr: "src/DocSSR.tsx", index: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    target: "es2020",
    external: ["react", "react-dom", "next", "framer-motion"],
  },
]);
