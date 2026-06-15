import { defineConfig } from 'tsdown';

import pkgJson from './package.json' with { type: 'json' };

export default defineConfig({
  entry: {
    next: './src/next/index.ts',
  },
  format: ['cjs', 'esm'],
  fixedExtension: false,
  clean: true,
  minify: false,
  sourcemap: true,
  dts: true,
  define: {
    PACKAGE_VERSION: `"${pkgJson.version}"`,
  },
});
