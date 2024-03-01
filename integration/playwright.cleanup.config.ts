import { defineConfig } from '@playwright/test';
import { config } from 'dotenv';
import * as path from 'path';

import { common } from './playwright.config';

config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
  ...common,
  testDir: './cleanup',
  projects: [
    {
      name: 'setup',
      testMatch: /cleanup\.setup/,
      // 5 minutes
      timeout: 5 * 60 * 1000,
    },
  ],
});
