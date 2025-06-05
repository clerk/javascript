import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    __PKG_NAME__: JSON.stringify('@clerk/clerk-js'),
  },
  test: {
    include: ['**/*.spec.?(c|m)[jt]s?(x)'],
    environment: 'jsdom',
    setupFiles: './vitest.setup.mts',
  },
});
