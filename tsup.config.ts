import { defineConfig } from "tsup";

export default defineConfig([
  // build “général”
  {
    entry: { index: "src/index.ts" },
    dts: true,
    format: ["esm", "cjs"],
    outDir: "dist",
    clean: true,
    treeshake: true,
    sourcemap: true,
  },
  // build client-only (ajoute le banner "use client")
  {
    entry: { "client/index": "src/client/index.ts" },
    dts: true,
    format: ["esm"],
    outDir: "dist",
    clean: false,
    treeshake: true,
    sourcemap: true,
    esbuildOptions(options) {
      options.banner = options.banner || {};
      options.banner.js = '"use client";';
    },
  },
  // build server-only
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
