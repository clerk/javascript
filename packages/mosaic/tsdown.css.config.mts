import stylexPlugin from '@stylexjs/rollup-plugin';
import { defineConfig } from 'tsdown';

import { mosaicLightningCssTargets } from './stylex-lightningcss.config.mjs';

export default defineConfig({
  entry: ['./src/styles/index.ts'],
  outDir: './dist-css',
  format: ['esm'],
  dts: false,
  clean: true,
  target: 'es2022',
  platform: 'browser',
  minify: false,
  sourcemap: false,
  tsconfig: './tsconfig.json',
  deps: {
    neverBundle: ['react', 'react-dom', '@stylexjs/stylex', /^@clerk\/headless(\/.*)?$/, /^@clerk\/shared(\/.*)?$/],
    onlyBundle: false,
  },
  plugins: [
    stylexPlugin({
      fileName: 'styles.css',
      useCSSLayers: true,
      lightningcssOptions: { targets: mosaicLightningCssTargets },
    }),
  ],
  onSuccess: async () => {
    const { cp, rm } = await import('node:fs/promises');
    await cp('./dist-css/styles.css', './dist/styles.css');
    await rm('./dist-css', { recursive: true, force: true });
    await rm('./dist/styles.partial.css', { force: true });
    await rm('./dist/index.js.map', { force: true });
  },
});
