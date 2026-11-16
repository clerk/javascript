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
    'components/action-menu': './src/components/action-menu/index.ts',
    'components/avatar': './src/components/avatar/index.ts',
    'components/badge': './src/components/badge/index.ts',
    'components/banner': './src/components/banner/index.ts',
    'components/button': './src/components/button/index.ts',
    'components/data-list': './src/components/data-list/index.ts',
    'components/empty-state': './src/components/empty-state/index.ts',
    'components/entity': './src/components/entity/index.ts',
    'components/heading': './src/components/heading/index.ts',
    'components/icon': './src/components/icon/index.ts',
    'components/input': './src/components/input/index.ts',
    'components/item': './src/components/item/index.ts',
    'components/panel': './src/components/panel/index.ts',
    'components/profile': './src/components/profile/index.ts',
    'components/radio': './src/components/radio/index.ts',
    'components/section': './src/components/section/index.ts',
    'components/segmented-control': './src/components/segmented-control/index.ts',
    'components/skeleton': './src/components/skeleton/index.ts',
    'components/table': './src/components/table/index.ts',
    'components/text': './src/components/text/index.ts',
    'icons/glyphs/arrow-up-right': './src/icons/glyphs/arrow-up-right.tsx',
    'icons/glyphs/code': './src/icons/glyphs/code.tsx',
    'icons/glyphs/external': './src/icons/glyphs/external.tsx',
    'icons/glyphs/plus': './src/icons/glyphs/plus.tsx',
    'icons/glyphs/shield-check': './src/icons/glyphs/shield-check.tsx',
    'icons/glyphs/user-circle': './src/icons/glyphs/user-circle.tsx',
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
