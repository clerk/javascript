import { test as setup } from '@playwright/test';

import { constants } from '../constants';
import { fs, startClerkJsHttpServer, startClerkUiHttpServer } from '../scripts';

setup('start long running apps', async () => {
  setup.setTimeout(300_000);

  await fs.ensureDir(constants.TMP_DIR);

  await startClerkJsHttpServer();
  await startClerkUiHttpServer();

  // Apps are now initialized lazily by testAgainstRunningApps via test.beforeAll.
  // Each app is started on-demand when a test first needs it, using file-based
  // locking to prevent duplicate initialization across Playwright workers.
  console.log('HTTP servers started. Apps will initialize lazily.');
});
