import { defineConfig } from 'tsup';

import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const shouldPublish = !!overrideOptions.env?.publish;

  return {
    clean: true,
    entry: [
      './src/module.ts',
      './src/runtime/plugin.ts',
      './src/runtime/components/*.ts',
      './src/runtime/composables/index.ts',
      './src/runtime/client/*.ts',
      './src/runtime/server/*.ts',
      './src/runtime/errors.ts',
      './src/runtime/webhooks.ts',
      './src/runtime/types/index.ts',
    ],
    format: ['esm'],
    // Make sure to not bundle the imports
    // or else the Nuxt module will not be able to resolve them
    bundle: false,
    sourcemap: true,
    minify: false,
    dts: true,
    onSuccess: shouldPublish ? 'pkglab pub --ping' : undefined,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
    },
    external: ['#imports'],
  };
});
