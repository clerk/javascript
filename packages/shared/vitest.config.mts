import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    watch: false,
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json',
      include: ['**/*.type.{test,spec}.{ts,tsx}'],
    },
    env: {
      CLERK_SECRET_KEY: 'TEST_SECRET_KEY',
    },
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    setupFiles: './vitest.setup.mts',
  },
});
