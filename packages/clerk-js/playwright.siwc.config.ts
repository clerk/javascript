import { defineConfig, devices } from '@playwright/test';

const host = process.env.CHATGPT_SIWC_HOST;

if (!host) {
  throw new Error('CHATGPT_SIWC_HOST is required');
}

export default defineConfig({
  testDir: './sandbox/integration',
  testMatch: 'chatgpt-siwc-real-browser.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: 'line',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `https://${host}`,
    ignoreHTTPSErrors: true,
    // The browser harness emits a sanitized redirect/cookie/body-field trace.
    // Playwright's raw network trace would retain callback, session, and PKCE
    // values, so do not persist it for this local security-flow fixture.
    trace: 'off',
  },
});
