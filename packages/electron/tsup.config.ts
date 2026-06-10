import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

import { runAfterLast } from '../../scripts/utils';
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  const common: Options = {
    entry: [
      './src/index.ts',
      './src/preload/index.ts',
      './src/react/index.tsx',
      './src/storage/index.ts',
      './src/passkeys/index.ts',
    ],
    bundle: true,
    external: ['@clerk/electron-passkeys'],
    clean: true,
    minify: false,
    sourcemap: true,
    legacyOutput: true,
    treeshake: true,
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

  return runAfterLast(['pnpm build:declarations', shouldPublish && 'pkglab pub --ping'])(esm, cjs);
});
