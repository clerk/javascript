import type { Options } from 'tsdown';
import { defineConfig } from 'tsdown';

import clerkJsPackage from '../clerk-js/package.json' with { type: 'json' };
import clerkUIPackage from '../ui/package.json' with { type: 'json' };
import sharedPackage from './package.json' with { type: 'json' };

export default defineConfig(({ watch, env }) => {
  const shouldPublish = !!env?.publish;

  const common = {
    sourcemap: true,
    target: 'es2022',
    platform: 'neutral',
    format: ['cjs', 'esm'],
    minify: false,
    define: {
      PACKAGE_NAME: `"${sharedPackage.name}"`,
      PACKAGE_VERSION: `"${sharedPackage.version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsPackage.version}"`,
      UI_PACKAGE_VERSION: `"${clerkUIPackage.version}"`,
      __DEV__: `${watch}`,
      __BUILD_DISABLE_RHC__: JSON.stringify(false),
    },
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
    outDir: './dist',
  } satisfies Options;

  return [
    // Runtime build: bundled. Selected devDependencies (zxcvbn, zustand, ...) are
    // intentionally inlined so consumers don't install them.
    {
      ...common,
      dts: false,
      clean: true,
      external: ['react', 'react-dom'],
      onSuccess: shouldPublish ? 'pkglab pub --ping' : undefined,
      // Route rolldown's shared chunks into a nested `_chunks/` directory. The
      // package's `"./*"` wildcard export resolves to `dist/*`, and break-check
      // expands that surface with a single-segment `*`, so content-hashed internal
      // chunks sitting flat in `dist` get enumerated as phantom public subpaths.
      // Nesting them one level down keeps them out of that API-snapshot expansion;
      // package subpath imports are blocked separately by the `./_chunks/*` null export.
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
    // Declarations build: unbundled, separate from the runtime build. Every public
    // symbol's declaration must live at a stable, real-named path that downstream
    // declaration emit (tsc, vue-tsc, rolldown-plugin-dts) can reference through
    // this package's public subpath exports. Bundled declarations instead hoist
    // shared types into content-hashed chunks with mangled aliases, and downstream
    // packages' d.ts then hardcode specifiers like `@clerk/shared/_chunks/index-<hash>`,
    // which `"./_chunks/*": null` blocks and whose names churn on every build.
    // All bare imports stay external so the inlined runtime deps above don't get
    // their type modules mirrored into `dist/node_modules` (npm strips that path
    // at pack time); their type imports resolve from the consumer's node_modules,
    // matching how this package has always published its declarations.
    {
      ...common,
      dts: { emitDtsOnly: true, sourcemap: false },
      // Declaration sourcemaps are skipped: rolldown-plugin-dts can't produce them
      // in this mode (SOURCEMAP_BROKEN warning), and they'd reference src files
      // that aren't shipped in the tarball anyway.
      sourcemap: false,
      clean: false,
      unbundle: true,
      // Bare specifiers stay external, except the `@/*` tsconfig path alias,
      // which must be resolved back to relative imports within this package.
      external: [/^(?!@\/)[^./]/],
    },
  ] satisfies Options[];
});
