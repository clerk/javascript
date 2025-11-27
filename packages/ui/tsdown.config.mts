import svgr from '@svgr/rollup';
import type { Options } from 'tsdown';
import { defineConfig } from 'tsdown';

import uiPackage from './package.json' with { type: 'json' };

export default defineConfig(({ watch }) => {
  const common = {
    dts: true,
    sourcemap: true,
    clean: false,
    target: 'es2022',
    platform: 'browser',
    external: ['react', 'react-dom', '@clerk/localizations', '@clerk/shared'],
    format: ['esm'], // ESM only
    minify: false,
    plugins: [svgr()],
    define: {
      PACKAGE_NAME: `"${uiPackage.name}"`,
      PACKAGE_VERSION: `"${uiPackage.version}"`,
      __PKG_VERSION__: `"${uiPackage.version}"`,
      __DEV__: `${watch}`,
    },
  } satisfies Options;

  return [
    {
      ...common,
      entry: ['./src/index.ts', './src/entry.ts', './src/internal/index.ts'],
      outDir: './dist',
      unbundle: true,
    },
  ];
});
