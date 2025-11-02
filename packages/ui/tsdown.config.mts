import type { Options } from 'tsdown';
import { defineConfig } from 'tsdown';

import pkgjson from './package.json' with { type: 'json' };

export default defineConfig(({ watch }) => {
  return {
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2022',
    platform: 'neutral',
    unbundle: false,
    // external: ['react', 'react-dom'],
    format: ['cjs', 'esm'],
    minify: false,
    define: {
      PACKAGE_NAME: `"${pkgjson.name}"`,
      PACKAGE_VERSION: `"${pkgjson.version}"`,
      __DEV__: `${watch}`,
    },
    entry: ['./src/index.ts', './src/internal.ts'],
  } satisfies Options;
});
