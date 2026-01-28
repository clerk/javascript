import { defineConfig } from 'tsdown';

import packageJson from './package.json' with { type: 'json' };

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: './dist',
  dts: false, // We use dts-bundle-generator for bundled types
  sourcemap: true,
  clean: true,
  target: 'es2022',
  platform: 'neutral',
  format: ['cjs', 'esm'],
  minify: false,
  external: [],
  define: {
    PACKAGE_NAME: `"${packageJson.name}"`,
    PACKAGE_VERSION: `"${packageJson.version}"`,
  },
});
