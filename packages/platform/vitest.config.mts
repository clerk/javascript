import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    typecheck: {
      enabled: true,
      include: ['**/*.test.ts'],
    },
    coverage: {
      provider: 'v8',
    },
    globals: true,
    environment: 'node',
  },
});
