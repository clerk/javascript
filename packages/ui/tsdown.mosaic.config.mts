import stylexPlugin from '@stylexjs/rollup-plugin';
import { defineConfig } from 'tsdown';
import { mosaicLightningCssTargets } from './stylex-lightningcss.config.mjs';

// Isolated Mosaic build: compiles ONLY the StyleX barrel (`src/mosaic/styles`)
// with the StyleX rollup plugin, emitting transformed ESM + a single static
// `styles.css` that consumers import. Kept separate from the main tsdown build so
// the Emotion-based code is untouched and this entry stays Emotion-free.
//
// `useCSSLayers` wraps StyleX's atomic rules in `@layer priorityN` for correct
// intra-StyleX precedence; consumers import the sheet into a layer they control
// (`@import '@clerk/ui/experimental/mosaic/styles.css' layer(components)`), under which those nest
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
  // `@clerk/headless` stays external here (the main build inlines it): this entry exists to
  // extract `styles.css`, and only that file is exported from the package — so there is nothing
  // to gain from pulling the primitives and their deps into a bundle nobody imports.
  external: ['react', 'react-dom', '@stylexjs/stylex', /^@clerk\/headless/],
  // The bundle collapses every module into one, so the per-file `'use client'` directives are lost.
  // Everything here is interactive and hook-driven, so the entry is a client boundary in whole —
  // without this, importing it from a React Server Component fails.
  outputOptions: { banner: "'use client';" },
  plugins: [
    stylexPlugin({
      fileName: 'styles.css',
      useCSSLayers: true,
      lightningcssOptions: { targets: mosaicLightningCssTargets },
    }),
  ],
});
