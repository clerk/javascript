import { defineConfig } from 'tsdown';

import pkgJson from './package.json' with { type: 'json' };

export default defineConfig({
  entry: {
    next: './src/next/index.ts',
    fixAuthProtection: './src/fix-auth-protection.ts',
    cli: './src/cli.ts',
  },
  format: ['cjs', 'esm'],
  fixedExtension: false,
  clean: true,
  minify: false,
  sourcemap: true,
  dts: true,
  // `eslint` is a peer dependency resolved from the consumer's install; never
  // bundle it into the fix runner / CLI.
  external: ['eslint'],
  define: {
    PACKAGE_VERSION: `"${pkgJson.version}"`,
  },
});
