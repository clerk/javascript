/* eslint-disable turbo/no-undeclared-env-vars */
import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(__dirname, '.env.local') });

export const common = {
  testDir: './tests',
  snapshotDir: './tests/snapshots',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : '70%',
  reporter: 'line',
  use: {
    trace: 'on-first-retry',
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
  ],
});
