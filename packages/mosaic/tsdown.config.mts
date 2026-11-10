import stylexPlugin from '@stylexjs/rollup-plugin';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig } from 'tsdown';

import { mosaicLightningCssTargets } from './stylex-lightningcss.config.mjs';

const require = createRequire(import.meta.url);
const typescriptDir = dirname(require.resolve('typescript/package.json'));
const { default: getTypeScriptExecutablePath } = await import(
  pathToFileURL(join(typescriptDir, 'lib/getExePath.js')).href
);

export default defineConfig({
  entry: {
    index: './src/index.ts',
    'components/avatar': './src/components/avatar/index.ts',
    'components/badge': './src/components/badge/index.ts',
    'components/data-list': './src/components/data-list/index.ts',
    'components/entity': './src/components/entity/index.ts',
  },
  outDir: './dist',
  format: ['esm'],
  dts: {
    sourcemap: true,
    tsgo: { path: getTypeScriptExecutablePath() },
  },
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
