import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

import { runAfterLast } from '../../scripts/utils';
// @ts-ignore
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;
  const isTest = !!overrideOptions.env?.test;

  if (isTest) {
    return {
      entry: ['./src/**/*.{ts,js}'],
      outDir: 'tests/dist/',
      define: {
        PACKAGE_NAME: `"${name}"`,
        // use "test" instead of actual package version to avoid updating the tests
        // depending on it (eg userAgent related) on every version bump
        PACKAGE_VERSION: `"test"`,
        __DEV__: `${isWatch}`,
      },
      external: ['#crypto'],
      clean: true,
      minify: false,
      tsconfig: 'tsconfig.test.json',
      format: 'cjs',
    };
  }

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

  return runAfterLast(['npm run build:declarations', shouldPublish && 'npm run publish:local'])(esm, cjs);
});
