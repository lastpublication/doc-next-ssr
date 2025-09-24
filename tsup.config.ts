import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    dts: true,
    format: ["esm", "cjs"],
    outDir: "dist",
    clean: true,
    treeshake: true,
    sourcemap: true,
  },
  {
    entry: { "client/index": "src/client/index.ts" },
    dts: true,
    format: ["esm"],
    outDir: "dist",
    clean: false,
    treeshake: true,
    sourcemap: true,
    banner: { js: '"use client";' },
    bundle: true, // ⬅️ EMBARQUE DocClient + utils => plus d’imports relatifs
    splitting: false,
    minify: false,
  },
  {
    entry: { "server/index": "src/server/index.ts" },
    dts: true,
    format: ["esm"],
    outDir: "dist",
    clean: false,
    treeshake: true,
    sourcemap: true,
  },
]);
