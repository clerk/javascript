import autoPropsPlugin from '@vue.ts/tsx-auto-props/esbuild';
import { defineConfig } from 'tsup';
import vuePlugin from 'unplugin-vue/esbuild';

import { name, version } from './package.json';

export default defineConfig(() => {
  return {
    clean: true,
    entry: ['./src/index.ts', './src/experimental.ts', './src/internal.ts', './src/errors.ts', './src/types/index.ts'],
    format: ['esm'],
    bundle: true,
    sourcemap: true,
    minify: false,
    dts: false,
    esbuildPlugins: [
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
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
    },
    external: ['vue'],
  };
});
