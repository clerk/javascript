import { defineConfig } from 'tsup';

import { version as clerkJsVersion } from '../clerk-js/package.json';
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  return {
    entry: {
      index: 'src/index.ts',
      internal: 'src/internal.ts',
      errors: 'src/errors.ts',
    },
    dts: true,
    onSuccess: shouldPublish ? 'pnpm publish:local' : undefined,
    format: ['cjs', 'esm'],
    bundle: true,
    clean: true,
    minify: false,
    sourcemap: !isProd,
    external: ['react', 'react-dom'],
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsVersion}"`,
      __DEV__: `${isWatch}`,
    },
  };
});
