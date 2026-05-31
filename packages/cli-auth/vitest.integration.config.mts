import { defineConfig } from 'vitest/config';

/**
 * Integration tests hit a real Clerk instance — they create users, API keys, and M2M
 * tokens via the Backend SDK and clean up in `afterAll`. Run with `pnpm test:integration`
 * and a `CLERK_SECRET_KEY` set in the environment. Suites `describe.skipIf` themselves
 * when the secret is missing, so CI without it is a no-op rather than a failure.
 */
export default defineConfig({
  plugins: [],
  test: {
    include: ['src/__tests__/integration/**/*.test.ts'],
    setupFiles: './vitest.setup.mts',
    // Network calls + BAPI rate limits — longer timeouts than the unit suite.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Sequential to keep BAPI traffic predictable; we share resources via beforeAll.
    fileParallelism: false,
    coverage: {
      enabled: false,
    },
  },
});
