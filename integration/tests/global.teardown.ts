import { test as setup } from '@playwright/test';

import { constants } from '../constants';
import { stateFile } from '../models/stateFile';
import { appConfigs } from '../presets';
import { killClerkJsHttpServer, killClerkUiHttpServer, parseEnvOptions } from '../scripts';

setup('teardown long running apps', async () => {
  setup.setTimeout(90_000);

  const { appUrl } = parseEnvOptions();
  await killClerkJsHttpServer();
  await killClerkUiHttpServer();

  if (appUrl || !constants.CLEANUP) {
    // if appUrl is provided, it means that the user is running an app manually
    console.log('Skipping cleanup');
    return;
  }

  const runningAppsFoundInStateFile = Object.values(stateFile.getLongRunningApps() ?? {});
  if (runningAppsFoundInStateFile.length > 0) {
    const matchingLongRunningApps = appConfigs.longRunningApps.getByPattern(
      runningAppsFoundInStateFile.map(app => app.id),
    );
    await Promise.all(matchingLongRunningApps.map(app => app.destroy()));
  }
  stateFile.remove();
  console.log('Long running apps destroyed');
});
