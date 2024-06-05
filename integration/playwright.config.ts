/* eslint-disable turbo/no-undeclared-env-vars */
import os from 'node:os';

import type { PlaywrightTestConfig } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(__dirname, '.env.local') });

const numAvailableWorkers = os.cpus().length - 1;

export const common: PlaywrightTestConfig = {
  testDir: './tests',
  snapshotDir: './tests/snapshots',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 90000,
  maxFailures: process.env.CI ? 1 : undefined,
  workers: process.env.CI ? numAvailableWorkers : '70%',
  reporter: process.env.CI ? 'line' : 'list',
  use: {
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
