import type { Options } from 'tsdown';
import { defineConfig } from 'tsdown';

import clerkJsPackage from '../clerk-js/package.json' with { type: 'json' };
import sharedPackage from './package.json' with { type: 'json' };

export default defineConfig(({ watch }) => {
  const common = {
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2022',
    platform: 'neutral',
    external: ['react', 'react-dom'],
    format: ['cjs', 'esm'],
    minify: false,
    define: {
      PACKAGE_NAME: `"${sharedPackage.name}"`,
      PACKAGE_VERSION: `"${sharedPackage.version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsPackage.version}"`,
      __DEV__: `${watch}`,
    },
  } satisfies Options;

  return [
    {
      ...common,
      entry: ['./src/types/index.ts'],
      unbundle: false,
      outDir: './dist/types',
    },
    // {
    //   ...common,
    //   entry: [
    //     // all files except types
    //     './src/*.{ts,tsx}',
    //     './src/*/index.{ts,tsx}',
    //     // '!./src/types/*.{ts,tsx}',
    //     '!./src/**/*.{test,spec}.{ts,tsx}',
    //   ],
    //   outDir: './dist/runtime',
    //   unbundle: false,
    // },
  ];
});
