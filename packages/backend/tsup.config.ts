import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

import { runAfterLast } from '../../scripts/utils';
// @ts-ignore
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  const common: Options = {
    entry: ['src/index.ts', 'src/errors.ts', 'src/internal.ts', 'src/jwt/index.ts'],
    onSuccess: `cpy 'src/runtime/**/*.{mjs,js,cjs}' dist/runtime`,
    sourcemap: true,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${isWatch}`,
    },
    external: ['#crypto'],
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

  return runAfterLast(['pnpm build:declarations', shouldPublish && 'pnpm publish:local'])(esm, cjs);
});
