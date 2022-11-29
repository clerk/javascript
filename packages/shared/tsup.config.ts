import { Plugin, transform } from 'esbuild';
import { readFile } from 'fs/promises';
import { defineConfig } from 'tsup';

import { version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';

  return {
    entry: ['src/index.ts', 'src/testUtils/index.ts'],
    onSuccess: 'tsc',
    minify: isProd,
    clean: true,
    sourcemap: true,
    format: ['cjs', 'esm'],
    define: { PACKAGE_VERSION: `"${version}"`, __DEV__: `${!isProd}` },
    external: ['@testing-library', 'react', 'react-test-renderer', 'jest', 'jest-environment-jsdom', 'react-dom'],
    legacyOutput: true,
    esbuildPlugins: [WebWorkerMinifyPlugin],
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
      const js = await transform(f, { loader: 'ts', minify: true });
      return { loader: 'text', contents: js.code };
    });
  },
};
