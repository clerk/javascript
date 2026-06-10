import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    watch: false,
    setupFiles: './vitest.setup.mts',
  },
});
