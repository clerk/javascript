import { defineConfig } from 'tsdown';

import pkgJson from './package.json' with { type: 'json' };

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
    unbundle: true,
    sourcemap: true,
    minify: false,
    dts: true,
    onSuccess: shouldPublish ? 'pkglab pub --ping' : undefined,
    define: {
      PACKAGE_NAME: `"${pkgJson.name}"`,
      PACKAGE_VERSION: `"${pkgJson.version}"`,
    },
    external: ['#imports', 'nuxt', 'nuxt/app', '@nuxt/kit', '@nuxt/schema'],
  };
});
