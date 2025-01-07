import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json',
      include: ['**/*.test.{ts,tsx}'],
    },
    env: {
      CLERK_SECRET_KEY: 'TEST_SECRET_KEY',
    },
    environment: 'jsdom',
    includeSource: ['**/*.{js,ts,jsx,tsx}'],
    setupFiles: './vitest.setup.mts',
  },
});
