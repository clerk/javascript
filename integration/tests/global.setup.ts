import { execSync } from 'node:child_process';

import { test as setup } from '@playwright/test';

import { constants } from '../constants';
import { appConfigs } from '../presets';
import { fs, parseEnvOptions, startClerkJsHttpServer, startClerkUiHttpServer } from '../scripts';

setup('start long running apps', async () => {
  setup.setTimeout(90_000);

  // Ensure pkglab registry is running. The daemon may have exited between CI steps
  // but packages persist on disk, so restarting picks them back up.
  try {
    execSync('pkglab status --health', { timeout: 5000 });
  } catch {
    try {
      execSync('pkglab up', { timeout: 10_000 });
    } catch {
      throw new Error(
        'pkglab registry is not running and could not be started. Run: pkglab pub\n' +
          'This publishes local packages to a Verdaccio registry for integration tests.',
      );
    }
  }

  await fs.ensureDir(constants.TMP_DIR);

  await startClerkJsHttpServer();
  await startClerkUiHttpServer();

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
