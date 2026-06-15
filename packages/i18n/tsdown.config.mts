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
  // React is a peer; alien-signals is a runtime dependency. Neither is bundled.
  external: ['react', 'react-dom', 'alien-signals'],
});
