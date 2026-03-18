import { defineConfig } from '@playwright/test';
import { config } from 'dotenv';
import * as path from 'path';

import { common } from './playwright.config';

config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
  ...common,
  testDir: './tests/chrome-extension',
  // No global setup/teardown — extension build is handled by worker-scoped fixtures
  projects: [
    {
      name: 'chrome-extension',
      // Extension loading uses chromium.launchPersistentContext in fixtures
      // with --load-extension flags. No channel override needed — Playwright's
      // bundled Chromium supports extensions when launched this way.
    },
  ],
});
