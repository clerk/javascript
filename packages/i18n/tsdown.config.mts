import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts', './src/react/index.ts'],
  outDir: './dist',
  format: ['cjs', 'esm'],
  target: 'es2022',
  platform: 'neutral',
  sourcemap: true,
  clean: true,
  dts: true,
  // Keep runtime deps external so consumers dedupe a single copy. nanostores in
  // particular coordinates `task()`/`allTasks()` through a module-level registry,
  // so a bundled copy would not share that registry with the consumer's own.
  external: ['react', 'react-dom', 'nanostores'],
});
