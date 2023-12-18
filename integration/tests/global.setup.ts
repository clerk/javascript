import { test as setup } from '@playwright/test';

import { constants } from '../constants';
import { appConfigs } from '../presets';
import { fs, parseEnvOptions, startClerkJsHttpServer } from '../scripts';

setup('start long running apps', async () => {
  await fs.ensureDir(constants.TMP_DIR);

  await startClerkJsHttpServer();

  const { appIds } = parseEnvOptions();
  if (appIds.length) {
    const apps = appConfigs.longRunningApps.getByPattern(appIds);
    // state cannot be shared using playwright,
    // so we save the state in a file using a strategy similar to `storageState`
    await Promise.all(apps.map(app => app.init()));
  } else {
    // start a single app using the available env variables
  }
  console.log('Apps started');
});
