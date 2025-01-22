import { defineConfig } from 'tsup';

import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';

  return {
    clean: true,
    entry: [
      './src/module.ts',
      './src/runtime/plugin.ts',
      './src/runtime/components/index.ts',
      './src/runtime/composables/index.ts',
      './src/runtime/server/*.ts',
    ],
    format: ['esm'],
    // Make sure to not bundle the imports
    // or else the Nuxt module will not be able to resolve them
    bundle: false,
    sourcemap: !isProd,
    minify: false,
    dts: true,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
    },
    external: ['#imports'],
  };
});
