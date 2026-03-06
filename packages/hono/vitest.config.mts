import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'json', 'html'],
    },
    env: {
      CLERK_SECRET_KEY: 'TEST_SECRET_KEY',
      CLERK_PUBLISHABLE_KEY: 'TEST_PUBLISHABLE_KEY',
    },
    setupFiles: './vitest.setup.mts',
  },
});
