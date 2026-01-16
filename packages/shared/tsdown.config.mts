import type { Options } from 'tsdown';
import { defineConfig } from 'tsdown';

import clerkJsPackage from '../clerk-js/package.json' with { type: 'json' };
import clerkUiPackage from '../ui/package.json' with { type: 'json' };
import sharedPackage from './package.json' with { type: 'json' };

export default defineConfig(({ watch }) => {
  const common = {
    dts: true,
    sourcemap: true,
    clean: false,
    target: 'es2022',
    platform: 'neutral',
    external: ['react', 'react-dom'],
    format: ['cjs', 'esm'],
    minify: false,
    define: {
      PACKAGE_NAME: `"${sharedPackage.name}"`,
      PACKAGE_VERSION: `"${sharedPackage.version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsPackage.version}"`,
      UI_PACKAGE_VERSION: `"${clerkUiPackage.version}"`,
      __DEV__: `${watch}`,
      __BUILD_DISABLE_RHC__: JSON.stringify(false),
    },
  } satisfies Options;

  return [
    {
      ...common,
      entry: [
        //
        './src/types/index.ts',
      ],
      unbundle: false,
      outDir: './dist/types',
    },
    {
      ...common,
      entry: [
        './src/*.{ts,tsx}',
        './src/react/index.ts',
        './src/utils/index.ts',
        './src/workerTimers/index.ts',
        './src/types/index.ts',
        './src/dom/*.ts',
        './src/ui/index.ts',
        './src/internal/clerk-js/*.ts',
        './src/internal/clerk-js/**/*.ts',
        '!./src/**/*.{test,spec}.{ts,tsx}',
      ],
      outDir: './dist/runtime',
      unbundle: false,
    },
  ];
});
