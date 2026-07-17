import stylexPlugin from '@stylexjs/rollup-plugin';
import { defineConfig } from 'tsdown';

// Isolated POC build: compiles ONLY src/mosaic-x with the StyleX rollup plugin,
// emitting transformed ESM + a single static mosaic.css stylesheet that consumers
// import. Kept separate from the main tsdown build so the Emotion-based code is
// untouched. `useCSSLayers` wraps StyleX's atomic rules in `@layer priorityN` for
// correct intra-StyleX precedence; consumers import the sheet into a layer they
// control (`@import '@clerk/ui/mosaic.css' layer(components)`) under which those
// nest cleanly, and override from a later layer.
export default defineConfig({
  entry: ['./src/mosaic-x/index.ts'],
  outDir: './dist-mosaic-x',
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'es2022',
  platform: 'browser',
  minify: false,
  // Use the standard React JSX runtime, not Emotion's — mosaic-x must be Emotion-free.
  tsconfig: './tsconfig.mosaic-x.json',
  external: ['react', 'react-dom', '@stylexjs/stylex'],
  plugins: [
    stylexPlugin({
      fileName: 'mosaic.css',
      useCSSLayers: true,
    }),
  ],
});
