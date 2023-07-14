import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

import { runAfterLast } from '../../scripts/utils';
// @ts-ignore
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  const common: Options = {
    entry: ['src/index.ts'],
    onSuccess: `rsync -r --include '*/' --include '*.js' --include '*.mjs' --include '*.cjs' --exclude='*' ./src/runtime ./dist/`,
    sourcemap: true,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${isWatch}`,
    },
    external: ['#crypto', '#fetch'],
    legacyOutput: true,
    bundle: true,
    clean: true,
    minify: false,
  };

  const esm: Options = {
    ...common,
    format: 'esm',
  };

  const cjs: Options = {
    ...common,
    format: 'cjs',
  };

  return runAfterLast(['npm run build:declarations', shouldPublish && 'npm run publish:local'])(esm, cjs);
});
