import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  splitting: false,
  clean: true,
  external: ['react', 'react-dom', 'next', 'framer-motion']
});
