import stylexPlugin from '@stylexjs/rollup-plugin';
import { defineConfig } from 'tsdown';

import { mosaicLightningCssTargets } from './stylex-lightningcss.config.mjs';

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: './dist',
  format: ['esm'],
  dts: { sourcemap: true },
  clean: true,
  target: 'es2022',
  platform: 'browser',
  minify: false,
  sourcemap: false,
  tsconfig: './tsconfig.json',
  deps: {
    neverBundle: ['react', 'react-dom', /^@clerk\/shared(\/.*)?$/],
    alwaysBundle: [/^@stylexjs\//],
    onlyBundle: false,
  },
  plugins: [
    stylexPlugin({
      fileName: 'styles.partial.css',
      useCSSLayers: true,
      lightningcssOptions: { targets: mosaicLightningCssTargets },
    }),
  ],
  onSuccess: async () => {
    const { rm } = await import('node:fs/promises');
    await rm('./dist/index.js.map', { force: true });
  },
});
