import { defineConfig } from 'tsdown';

import pkgJson from './package.json' with { type: 'json' };

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  fixedExtension: false,
  clean: true,
  minify: false,
  sourcemap: true,
  dts: true,
  transform: {
    define: {
      PACKAGE_VERSION: `"${pkgJson.version}"`,
    },
  },
});
