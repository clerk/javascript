import type { Plugin } from 'esbuild';
import * as esbuild from 'esbuild';
import { readFile } from 'fs/promises';
import { defineConfig } from 'tsup';

import { version as clerkJsVersion } from '../clerk-js/package.json';
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;

  return {
    entry: [
      './src/*.{ts,tsx}',
      './src/react/index.ts',
      './src/utils/index.ts',
      './src/workerTimers/index.ts',
      './src/dom/*.ts',
      '!./src/**/*.test.{ts,tsx}',
    ],
    format: ['cjs', 'esm'],
    bundle: true,
    clean: true,
    minify: false,
    sourcemap: true,
    dts: true,
    external: ['react', 'react-dom'],
    esbuildPlugins: [WebWorkerMinifyPlugin as any, preserveImportMetaPlugin],
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsVersion}"`,
      __DEV__: `${isWatch}`,
    },
  };
});

// Read transform and minify any files ending in .worker.ts
// These files can be imported as modules and used as string when instantiating
// a new web worker, without loading an external file during runtime
export const WebWorkerMinifyPlugin: Plugin = {
  name: 'WebWorkerMinifyPlugin',
  setup(build) {
    build.onLoad({ filter: /\.worker\.ts/ }, async args => {
      const f = await readFile(args.path);
      const js = await esbuild.transform(f, { loader: 'ts', minify: true });
      return { loader: 'text', contents: js.code };
    });
  },
};

/**
 * Preserves import.meta functionality in ESM builds while maintaining ES5 compatibility.
 * We originally used target: 'es2020' to handle this but it broke support for older browsers (e.g. iOS 12).
 */
const preserveImportMetaPlugin: Plugin = {
  name: 'preserve-import-meta',
  setup(build) {
    build.onEnd(result => {
      if (!result.outputFiles) return;

      result.outputFiles.forEach(file => {
        if (!file.path.endsWith('.mjs')) return;

        const contents = file.contents;
        const text = new TextDecoder().decode(contents);

        // Remove esbuild's var import_meta = {} transformation and restore original import.meta references
        const modified = text.replace(/var\s+import_meta\s*=\s*{};/g, '').replace(/import_meta/g, 'import.meta');

        file.contents = new TextEncoder().encode(modified);
      });
    });
  },
};
