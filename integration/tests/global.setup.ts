import { test as setup } from '@playwright/test';

import type { LongRunningApplication } from '../adapters/longRunningApplication';
import { constants } from '../constants';
import { longRunningApps } from '../presets';
import { fs } from '../utils';

/**
 * State cannot be shared using playwright,
 * so we save the state in a file using a strategy similar to `storageState`
 */
const startAllLongRunningApps = async (apps: LongRunningApplication[]) => {
  await fs.remove(constants.TMP_DIR);
  const contents = { longRunningApps: {} };
  await Promise.all(
    apps.map(async app => {
      if (contents.longRunningApps[app.name]) {
        throw new Error(`Long running app with name ${app.name} already exists`);
      }
      contents.longRunningApps[app.name] = await app.init();
    }),
  );
  await fs.ensureFile(constants.APPS_STATE_FILE);
  await fs.writeJson(constants.APPS_STATE_FILE, contents, { spaces: 2 });
};

setup('start long running apps', async () => {
  const apps = Object.values(longRunningApps)
    .map(type => Object.values(type))
    .flat();

  await startAllLongRunningApps(apps);
  console.log('Long running apps started');
});
