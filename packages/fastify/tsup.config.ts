import { defineConfig } from 'tsup';

import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  return {
    entry: {
      index: './src/index.ts',
      webhooks: './src/webhooks.ts',
      types: './src/types/index.ts',
    },
    format: ['cjs', 'esm'],
    bundle: true,
    clean: true,
    minify: false,
    sourcemap: true,
    dts: true,
    onSuccess: shouldPublish ? 'pkglab pub --ping' : undefined,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${isWatch}`,
    },
  };
});
