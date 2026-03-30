import type { Options } from 'tsdown';
import { defineConfig } from 'tsdown';

import { runAfterLast } from '../../scripts/utils.ts';
import clerkJsPkgJson from '../clerk-js/package.json' with { type: 'json' };
import pkgJson from './package.json' with { type: 'json' };

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  const options: Options = {
    format: 'cjs',
    outDir: './dist',
    entry: ['./src/**/*.{ts,tsx,js,jsx}', '!./src/**/*.test.{ts,tsx}', '!./src/**/__tests__/**'],
    bundle: false,
    clean: true,
    minify: false,
    sourcemap: true,
    define: {
      PACKAGE_NAME: `"${pkgJson.name}"`,
      PACKAGE_VERSION: `"${pkgJson.version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsPkgJson.version}"`,
      __DEV__: `${isWatch}`,
    },
  };

  return runAfterLast(['pnpm build:declarations', shouldPublish && 'pkglab pub --ping'])(options);
});
