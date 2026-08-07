/* eslint-disable turbo/no-undeclared-env-vars */

import type { PlaywrightTestConfig } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(__dirname, '.env.local') });

export const common: PlaywrightTestConfig = {
  testDir: './tests',
  snapshotDir: './tests/snapshots',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 5 : 0,
  maxFailures: process.env.CI ? 5 : undefined,
  workers: process.env.E2E_WORKERS ? Number(process.env.E2E_WORKERS) : process.env.CI ? '50%' : '70%',
  use: {
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    bypassCSP: true, // We probably need to limit this to specific tests
  },
} as const;

export default defineConfig({
  ...common,

  // Emit a machine-readable report in CI so the staging workflow's report job can
  // classify failures (flaky vs failed, infra vs regression) instead of reading a
  // single pass/fail boolean. Local runs keep the default human-readable list output.
  reporter: process.env.CI ? [['list'], ['json', { outputFile: 'playwright-report/results.json' }]] : 'list',

  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup/,
      teardown: 'teardown',
    },
    {
      name: 'teardown',
      testMatch: /global\.teardown/,
    },
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: {
          args: [process.env.DISABLE_WEB_SECURITY ? '--disable-web-security' : ''],
        },
      },

      dependencies: ['setup'],
    },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    //   dependencies: ['setup'],
    // },
  ],
});
