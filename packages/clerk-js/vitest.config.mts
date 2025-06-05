import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.spec.?(c|m)[jt]s?(x)'],
    environment: 'jsdom',
    setupFiles: './vitest.setup.mts',
  },
});
