/* eslint-disable turbo/no-undeclared-env-vars */

import type { PlaywrightTestConfig } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(__dirname, '.env.local') });

// modifying to trigger a test run arm

export const common: PlaywrightTestConfig = {
  testDir: './tests',
  snapshotDir: './tests/snapshots',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 5 : 0,
  timeout: 90_000,
  maxFailures: process.env.CI ? 5 : undefined,
  workers: process.env.CI ? '50%' : '70%',
  use: {
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    bypassCSP: true, // We probably need to limit this to specific tests
  },
} as const;

export default defineConfig({
  ...common,

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
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      dependencies: ['setup'],
    },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    //   dependencies: ['setup'],
    // },
  ],
});
