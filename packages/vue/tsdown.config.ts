import autoPropsPlugin from '@vue.ts/tsx-auto-props/rolldown';
import { defineConfig } from 'tsdown';
import vuePlugin from 'unplugin-vue/rolldown';

import { name, version } from './package.json' with { type: 'json' };

export default defineConfig(() => {
  return {
    clean: true,
    entry: ['./src/index.ts', './src/experimental.ts', './src/internal.ts', './src/errors.ts'],
    format: ['esm'],
    sourcemap: true,
    dts: false,
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
    transform: {
      define: {
        PACKAGE_NAME: `"${name}"`,
        PACKAGE_VERSION: `"${version}"`,
      },
    },
    external: ['vue'],
  };
});
