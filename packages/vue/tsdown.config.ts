import autoPropsPlugin from '@vue.ts/tsx-auto-props/rolldown';
import { defineConfig } from 'tsdown';
import vuePlugin from 'unplugin-vue/rolldown';

import pkgJson from './package.json' with { type: 'json' };

export default defineConfig(overrideOptions => {
  const shouldPublish = !!overrideOptions.env?.publish;

  return {
    clean: true,
    entry: ['./src/index.ts', './src/experimental.ts', './src/internal.ts', './src/errors.ts', './src/types/index.ts'],
    format: ['esm'],
    sourcemap: true,
    minify: false,
    dts: false,
    onSuccess: shouldPublish ? 'pnpm build:dts && pkglab pub --ping' : 'pnpm build:dts',
    plugins: [
      // Adds .vue files support
      vuePlugin(),
      // Automatically generates runtime props from TypeScript types/interfaces for all
      // control and UI components, adding them to Vue components during build via
      // Object.defineProperty
      autoPropsPlugin({
        include: ['**/*.ts'],
      }),
    ],
    define: {
      PACKAGE_NAME: `"${pkgJson.name}"`,
      PACKAGE_VERSION: `"${pkgJson.version}"`,
    },
  };
});
