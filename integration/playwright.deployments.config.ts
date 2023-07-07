import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import * as path from 'path';

import { common } from './playwright.config';

config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
  ...common,
  testDir: './deployments',
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
});
