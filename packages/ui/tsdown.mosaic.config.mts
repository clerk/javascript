import stylexPlugin from '@stylexjs/rollup-plugin';
import { defineConfig } from 'tsdown';

// lightningcss encodes browser versions as (major << 16) | (minor << 8) | patch.
const version = (major: number, minor = 0) => (major << 16) | (minor << 8);

// Pin targets to browsers that natively support `light-dark()` and `oklch()`
// (the token color model). Without this, the plugin defaults to a broad
// browserslist and lightningcss down-levels `light-dark()` into an incomplete
// `--lightningcss-*` polyfill (no prefers-color-scheme toggle rules), producing
// invalid two-token color values. These targets keep the tokens verbatim.
const targets = {
  chrome: version(123),
  edge: version(123),
  firefox: version(120),
  safari: version(17, 5),
  ios_saf: version(17, 5),
};

// Isolated Mosaic build: compiles ONLY the StyleX barrel (`src/mosaic/styles`)
// with the StyleX rollup plugin, emitting transformed ESM + a single static
// `styles.css` that consumers import. Kept separate from the main tsdown build so
// the Emotion-based code is untouched and this entry stays Emotion-free.
//
// `useCSSLayers` wraps StyleX's atomic rules in `@layer priorityN` for correct
// intra-StyleX precedence; consumers import the sheet into a layer they control
// (`@import '@clerk/ui/styles.css' layer(components)`), under which those nest
// cleanly, and override from a later layer.
export default defineConfig({
  entry: ['./src/mosaic/styles/index.ts'],
  outDir: './dist-mosaic',
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'es2022',
  platform: 'browser',
  minify: false,
  // Use the standard React JSX runtime, not Emotion's — the Mosaic build must be Emotion-free.
  tsconfig: './tsconfig.mosaic.json',
  external: ['react', 'react-dom', '@stylexjs/stylex'],
  plugins: [
    stylexPlugin({
      fileName: 'styles.css',
      useCSSLayers: true,
      lightningcssOptions: { targets },
    }),
  ],
});
