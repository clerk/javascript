import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

import { runAfterLast } from '../../scripts/utils';
// @ts-ignore
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = overrideOptions.env?.PUBLISH === 'true';

  const common: Options = {
    entry: ['./src/**/*.{ts,tsx,js,jsx}', '!./src/runtime/node', '!./src/runtime/browser'],
    bundle: false,
    clean: true,
    minify: false,
    sourcemap: true,
    legacyOutput: true,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${isWatch}`,
    },
    external: ['#crypto', '#fetch'],
  };

  const onSuccess = (format: 'esm' | 'cjs') => {
    const rsync = `rsync -r --include '*/' --include '*.js' --include '*.mjs' --include '*.cjs' --exclude='*' ./src/runtime ./dist/${format}/`;
    return `cp ./package.${format}.json ./dist/${format}/package.json && ${rsync}`;
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
