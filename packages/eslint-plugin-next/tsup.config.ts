import { defineConfig } from 'tsup';

import { version } from './package.json';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  bundle: true,
  clean: true,
  minify: false,
  sourcemap: true,
  dts: true,
  define: {
    PACKAGE_VERSION: `"${version}"`,
  },
});
