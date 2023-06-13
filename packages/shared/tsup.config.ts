import type { Plugin } from 'esbuild';
import { transform } from 'esbuild';
import { readFile } from 'fs/promises';
import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

import { runAfterLast } from '../../scripts/utils';
// @ts-ignore
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  const common: Options = {
    entry: ['./src/**/*.{ts,tsx,js,jsx}'],
    bundle: false,
    clean: true,
    minify: false,
    sourcemap: true,
    legacyOutput: true,
    external: ['@testing-library', 'react', 'jest', 'jest-environment-jsdom', 'react-dom'],
    esbuildPlugins: [WebWorkerMinifyPlugin as any],
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${isWatch}`,
    },
  };

  const onSuccess = (format: 'esm' | 'cjs') => {
    return `cp ./package.${format}.json ./dist/${format}/package.json`;
  };

  const esm: Options = {
    ...common,
    format: 'esm',
    onSuccess: onSuccess('esm'),
  };

  const cjs: Options = {
    ...common,
    format: 'cjs',
    outDir: './dist/cjs',
    onSuccess: onSuccess('cjs'),
  };

  return runAfterLast(['npm run build:declarations', shouldPublish && 'npm run publish:local'])(esm, cjs);
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
