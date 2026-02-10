import type { Options } from 'tsdown';
import { defineConfig } from 'tsdown';

import clerkJsPackage from './package.json' with { type: 'json' };

export default defineConfig(({ watch }) => {
  const common = {
    dts: true,
    sourcemap: true,
    clean: false,
    target: 'es2022',
    platform: 'browser',
    external: ['@clerk/shared'],
    format: ['esm'],
    minify: false,
    define: {
      PACKAGE_NAME: `"${clerkJsPackage.name}"`,
      PACKAGE_VERSION: `"${clerkJsPackage.version}"`,
      __DEV__: `${watch}`,
      __BUILD_DISABLE_RHC__: JSON.stringify(false),
    },
  } satisfies Options;

  return [
    // Build internal types, server (marker), entry point, and bundled wrapper
    // These are unbundled - the user's bundler handles dependency resolution
    {
      ...common,
      entry: ['./src/internal/index.ts', './src/server.ts', './src/entry.ts', './src/bundled.ts'],
      outDir: './dist/esm',
      unbundle: true,
    },
  ];
});
