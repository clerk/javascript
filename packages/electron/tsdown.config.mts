import type { Options } from 'tsdown';
import { defineConfig } from 'tsdown';

import { runAfterLast } from '../../scripts/utils.ts';
import pkgJson from './package.json' with { type: 'json' };

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  const common: Options = {
    entry: {
      index: './src/index.ts',
      'preload/index': './src/preload/index.ts',
      'react/index': './src/react/index.tsx',
      'storage/index': './src/storage/index.ts',
      'passkeys/index': './src/passkeys/index.ts',
    },
    clean: true,
    deps: {
      neverBundle: ['@clerk/electron-passkeys'],
    },
    dts: false,
    minify: false,
    sourcemap: true,
    treeshake: true,
    define: {
      PACKAGE_NAME: `"${pkgJson.name}"`,
      PACKAGE_VERSION: `"${pkgJson.version}"`,
      __DEV__: `${isWatch}`,
    },
  };

  const esm: Options = {
    ...common,
    format: 'esm',
    outDir: './dist/esm',
    outExtensions: () => ({ js: '.js' }),
  };

  const cjs: Options = {
    ...common,
    format: 'cjs',
    outDir: './dist/cjs',
    outExtensions: () => ({ js: '.js' }),
  };

  return runAfterLast(['pnpm build:declarations', shouldPublish && 'pkglab pub --ping'])(esm, cjs);
});
