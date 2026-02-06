import { test as setup } from '@playwright/test';

import { constants } from '../constants';
import { appConfigs } from '../presets';
import { fs, parseEnvOptions, startClerkJsHttpServer, startClerkUiHttpServer } from '../scripts';

setup('start long running apps', async () => {
  setup.setTimeout(240_000);

  await fs.ensureDir(constants.TMP_DIR);

  const httpServerStart = Date.now();
  await Promise.all([startClerkJsHttpServer(), startClerkUiHttpServer()]);
  console.log(`HTTP servers started in ${Date.now() - httpServerStart}ms`);

  const { appIds } = parseEnvOptions();
  if (appIds.length) {
    const apps = appConfigs.longRunningApps.getByPattern(appIds);
    // state cannot be shared using playwright,
    // so we save the state in a file using a strategy similar to `storageState`
    const appStart = Date.now();
    await Promise.all(apps.map(app => app.init()));
    console.log(`Apps initialized in ${Date.now() - appStart}ms`);
  } else {
    // start a single app using the available env variables
  }
  console.log('Apps started');
});
