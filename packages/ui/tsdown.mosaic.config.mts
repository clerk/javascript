import stylexPlugin from '@stylexjs/rollup-plugin';
import { defineConfig } from 'tsdown';
import { mosaicLightningCssTargets } from './stylex-lightningcss.config.mjs';

// Isolated Mosaic build: compiles `src/mosaic` with the StyleX rollup plugin, emitting transformed
// ESM + a single static `styles.css` that consumers import. Kept separate from the main tsdown build
// so the Emotion-based code is untouched and this entry stays Emotion-free.
//
// The entry is the narrow public surface, not the `src/mosaic/styles` barrel: the barrel exists to
// pull every migrated component into the StyleX graph, and pointing the published export at it would
// make all of them (and the headless primitive types behind them) API.
//
// `useCSSLayers` wraps StyleX's atomic rules in `@layer priorityN` for correct
// intra-StyleX precedence; consumers import the sheet into a layer they control
// (`@import '@clerk/ui/experimental/mosaic/styles.css' layer(components)`), under which those nest
// cleanly, and override from a later layer.
export default defineConfig({
  entry: ['./src/mosaic/index.ts'],
  outDir: './dist-mosaic',
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'es2022',
  platform: 'browser',
  minify: false,
  // Use the standard React JSX runtime, not Emotion's — the Mosaic build must be Emotion-free.
  tsconfig: './tsconfig.mosaic.json',
  // tsdown externalizes everything in `dependencies` by default, which is what we want for
  // `@clerk/shared`: it carries the Clerk context, so the host's copy has to be the one we read.
  // The two below have to override that default.
  //
  // `@clerk/headless` is a private workspace package. Left external, `@clerk/ui` publishes with a
  // dependency that does not exist on npm, and installing it 404s. `tsconfig.mosaic.json` already
  // resolves it to source, so this is the backstop: if a subpath ever escapes those `paths`, the
  // build fails loudly here instead of silently externalizing an unpublishable package.
  //
  // StyleX is compiled away at build time; only the tiny `props` merger survives. Bundling it keeps
  // it out of consumer trees entirely, so nobody inherits our StyleX version or has to have it.
  deps: {
    neverBundle: ['react', 'react-dom'],
    alwaysBundle: [/^@clerk\/headless/, '@stylexjs/stylex'],
  },
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
