import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'json', 'html'],
    },
    setupFiles: './vitest.setup.mts',
  },
});
