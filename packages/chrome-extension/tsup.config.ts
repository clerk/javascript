import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

import { runAfterLast } from '../../scripts/utils';
// @ts-ignore
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  const common: Options = {
    entry: ['./src/index.ts', './src/background/index.ts', './src/internal/index.ts', './src/react/index.ts'],
    bundle: true,
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

  const esm: Options = {
    ...common,
    format: 'esm',
  };

  const cjs: Options = {
    ...common,
    format: 'cjs',
    outDir: './dist/cjs',
  };

  return runAfterLast(['pnpm build:declarations', shouldPublish && 'pnpm publish:local'])(esm, cjs);
});
