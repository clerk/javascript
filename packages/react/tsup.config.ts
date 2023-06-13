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
