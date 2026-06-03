import type { Options } from 'tsdown';
import { defineConfig } from 'tsdown';

import clerkJsPackage from '../clerk-js/package.json' with { type: 'json' };
import clerkUIPackage from '../ui/package.json' with { type: 'json' };
import sharedPackage from './package.json' with { type: 'json' };

export default defineConfig(({ watch, env }) => {
  const shouldPublish = !!env?.publish;

  const common = {
    dts: true,
    sourcemap: true,
    clean: false,
    target: 'es2022',
    platform: 'neutral',
    external: ['react', 'react-dom'],
    format: ['cjs', 'esm'],
    minify: false,
    onSuccess: shouldPublish ? 'pkglab pub --ping' : undefined,
    define: {
      PACKAGE_NAME: `"${sharedPackage.name}"`,
      PACKAGE_VERSION: `"${sharedPackage.version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsPackage.version}"`,
      UI_PACKAGE_VERSION: `"${clerkUIPackage.version}"`,
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
        './src/keyless/index.ts',
        './src/internal/clerk-js/*.ts',
        './src/internal/clerk-js/**/*.ts',
        '!./src/**/*.{test,spec}.{ts,tsx}',
      ],
      outDir: './dist/runtime',
      unbundle: false,
      // Route rolldown's shared chunks into a nested `_chunks/` directory. The
      // package's `"./*"` wildcard export resolves to `dist/runtime/*`, and
      // break-check expands that surface with a single-segment `*`, so
      // content-hashed internal chunks sitting flat in `dist/runtime` get
      // enumerated as phantom public subpaths. Nesting them one level down keeps
      // them out of that API-snapshot expansion; package subpath imports are
      // blocked separately by the `./_chunks/*` null export.
      outputOptions: options => {
        const { chunkFileNames } = options;
        return {
          ...options,
          chunkFileNames:
            typeof chunkFileNames === 'function'
              ? info => `_chunks/${chunkFileNames(info)}`
              : `_chunks/${chunkFileNames ?? '[name]-[hash].js'}`,
        };
      },
    },
  ];
});
