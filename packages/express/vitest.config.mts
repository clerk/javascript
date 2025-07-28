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
      CLERK_SECRET_KEY: 'sk_test_....',
      CLERK_PUBLISHABLE_KEY: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
    },
    setupFiles: './vitest.setup.mts',
  },
});
