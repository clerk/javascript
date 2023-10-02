import { test as setup } from '@playwright/test';

import { constants } from '../constants';
import { stateFile } from '../models/stateFile';
import { appConfigs } from '../presets';
import { parseEnvOptions } from '../scripts';

setup('teardown long running apps', async () => {
  const { appUrl } = parseEnvOptions();
  if (appUrl || !constants.CLEANUP) {
    // if appUrl is provided, it means that the user is running an app manually
    console.log('Skipping cleanup');
    return;
  }
  const runningApps = Object.values(stateFile.getLongRunningApps());
  await Promise.all(runningApps.map(app => appConfigs.longRunning.getById(app.id).destroy()));
  stateFile.remove();
  console.log('Long running apps destroyed');
});
