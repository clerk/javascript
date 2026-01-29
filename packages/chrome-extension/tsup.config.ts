import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

import { runAfterLast } from '../../scripts/utils';
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  const common: Options = {
    entry: ['./src/index.ts', './src/background/index.ts', './src/react/index.ts', './src/types/index.ts'],
    bundle: true,
    clean: true,
    minify: false,
    sourcemap: true,
    legacyOutput: true,
    treeshake: true,
    noExternal: ['@clerk/react', '@clerk/shared'],
    external: ['use-sync-external-store', '@stripe/stripe-js', '@stripe/react-stripe-js'],
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${isWatch}`,
      __BUILD_DISABLE_RHC__: 'true',
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
