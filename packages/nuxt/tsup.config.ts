import { defineConfig } from 'tsup';

import { name, version } from './package.json';

export default defineConfig(() => {
  return {
    clean: true,
    entry: ['./src/index.ts', './src/runtime/plugin.ts', './src/runtime/server/*.ts'],
    format: ['esm'],
    bundle: false,
    sourcemap: true,
    minify: false,
    dts: true,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
    },
    external: ['#imports'],
  };
});
