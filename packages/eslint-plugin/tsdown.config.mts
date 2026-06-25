import { defineConfig } from 'tsdown';

import pkgJson from './package.json' with { type: 'json' };

export default defineConfig({
  entry: {
    next: './src/next/index.ts',
    'next/fix-auth-protection': './src/next/fix-auth-protection.ts',
    'next/fix-auth-protection-cli': './src/next/fix-auth-protection-cli.ts',
  },
  format: ['cjs', 'esm'],
  fixedExtension: false,
  clean: true,
  minify: false,
  sourcemap: true,
  dts: true,
  // `eslint` is a peer dependency resolved from the consumer's install; never
  // bundle it into the fix runner / CLI.
  deps: {
    neverBundle: ['eslint'],
  },
  define: {
    PACKAGE_VERSION: `"${pkgJson.version}"`,
  },
});
