import autoPropsPlugin from '@vue.ts/tsx-auto-props/esbuild';
import { defineConfig, type Options } from 'tsup';
import vuePlugin from 'unplugin-vue/esbuild';

import { name, version } from './package.json';

type EsbuildPlugin = NonNullable<Options['esbuildPlugins']>[number];

export default defineConfig(() => {
  return {
    clean: true,
    entry: ['./src/index.ts', './src/internal.ts', './src/errors.ts'],
    format: ['esm'],
    bundle: true,
    sourcemap: true,
    minify: false,
    dts: false,
    esbuildPlugins: [
      // Adds .vue files support
      vuePlugin() as EsbuildPlugin,
      // Automatically generates runtime props from TypeScript types/interfaces for all
      // control and UI components, adding them to Vue components during build via
      // Object.defineProperty
      autoPropsPlugin({
        include: ['**/*.ts'],
      }) as EsbuildPlugin,
    ],
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
    },
    external: ['vue'],
  };
});
