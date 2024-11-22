import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

import { runAfterLast } from '../../scripts/utils';
import { version as clerkJsVersion } from '../clerk-js/package.json';
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  const options: Options = {
    format: ['cjs', 'esm'],
    outDir: './dist',
    entry: ['./src/**/*.{ts,tsx,js,jsx}'],
    bundle: false,
    clean: true,
    minify: false,
    sourcemap: true,
    legacyOutput: false,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsVersion}"`,
      __DEV__: `${isWatch}`,
    },
  };

  return runAfterLast(['pnpm build:declarations', shouldPublish && 'pnpm publish:local'])(options);
});
