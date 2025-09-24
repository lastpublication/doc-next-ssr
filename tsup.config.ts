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
    bundle: false,
    splitting: false,
    minify: false,
    banner: { js: '"use client";' },
    esbuildOptions(options) {
      options.banner = options.banner || {};
      options.banner.js = '"use client";';
    },
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
