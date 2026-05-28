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
    // Integration tests live under src/__tests__/integration/ and require a real
    // CLERK_SECRET_KEY. Default `vitest run` is unit-only; use `pnpm test:integration`.
    exclude: ['**/node_modules/**', '**/dist/**', '**/__tests__/integration/**'],
  },
});
