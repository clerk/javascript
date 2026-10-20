import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const sharedRequire = createRequire(new URL('../../shared/package.json', import.meta.url));

export default defineConfig({
  define: {
    __BUILD_DISABLE_RHC__: 'false',
    __PKG_NAME__: JSON.stringify('@clerk/clerk-js'),
    __PKG_VERSION__: JSON.stringify('loom-probe'),
  },
  resolve: {
    alias: [
      { find: /^@\//, replacement: fileURLToPath(new URL('../../clerk-js/src/', import.meta.url)) },
      { find: '@tanstack/query-core', replacement: sharedRequire.resolve('@tanstack/query-core') },
    ],
  },
  test: {
    environment: 'node',
    include: ['packages/loom/research/*.test.mjs'],
    restoreMocks: true,
    unstubGlobals: true,
  },
});
