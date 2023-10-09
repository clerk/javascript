/* eslint-disable turbo/no-undeclared-env-vars */
import { test as setup } from '@playwright/test';

import { constants } from '../constants';
import type { LongRunningApplication } from '../models/longRunningApplication';
import { appConfigs } from '../presets';
import { fs, parseEnvOptions } from '../scripts';

setup('start long running apps', async () => {
  const { appIds } = parseEnvOptions();
  if (appIds.length) {
    // start all apps with the given ids
    const apps = appConfigs.longRunningApps.getByPattern(appIds);
    await startLongRunningApps(apps);
  } else {
    // start a single app using the available env variables
  }
  console.log('Apps started');
});

/**
 * State cannot be shared using playwright,
 * so we save the state in a file using a strategy similar to `storageState`
 */
const startLongRunningApps = async (apps: LongRunningApplication[]) => {
  await fs.remove(constants.TMP_DIR);
  return Promise.all(apps.map(app => app.init()));
};
