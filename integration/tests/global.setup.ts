import { test as setup } from '@playwright/test';

import { constants } from '../constants';
import { appConfigs } from '../presets';
import { fs, parseEnvOptions, startClerkJsHttpServer } from '../scripts';

setup('start long running apps', async () => {
  setup.setTimeout(240_000);

  console.log('[Setup] Starting long running apps setup...');

  await fs.ensureDir(constants.TMP_DIR);
  console.log('[Setup] Temp directory ensured');

  await startClerkJsHttpServer();
  console.log('[Setup] Clerk JS HTTP server started');

  const { appIds } = parseEnvOptions();
  console.log('[Setup] App IDs:', appIds);

  if (appIds.length) {
    const apps = appConfigs.longRunningApps.getByPattern(appIds);
    console.log('[Setup] Starting', apps.length, 'apps...');
    // state cannot be shared using playwright,
    // so we save the state in a file using a strategy similar to `storageState`
    const startTime = Date.now();
    await Promise.all(
      apps.map(app => {
        console.log(`[Setup] Initializing app: ${app.name}`);
        return app.init();
      }),
    );
    const duration = Date.now() - startTime;
    console.log(`[Setup] Apps initialized in ${duration}ms`);
  } else {
    // start a single app using the available env variables
    console.log('[Setup] No app IDs provided, skipping app initialization');
  }
  console.log('Apps started');
});
