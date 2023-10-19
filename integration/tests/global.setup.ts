/* eslint-disable turbo/no-undeclared-env-vars */
import { test as setup } from '@playwright/test';

import { constants } from '../constants';
import { appConfigs } from '../presets';
import { fs, parseEnvOptions } from '../scripts';

setup('start long running apps', async () => {
  const { appIds } = parseEnvOptions();
  if (appIds.length) {
    // await cleanupOldProcesses();
    await fs.remove(constants.TMP_DIR);
    const apps = appConfigs.longRunningApps.getByPattern(appIds);
    // state cannot be shared using playwright,
    // so we save the state in a file using a strategy similar to `storageState`
    await Promise.all(apps.map(app => app.init()));
  } else {
    // start a single app using the available env variables
  }
  console.log('Apps started');
});

// Useful to make sure that older processes are killed before starting new ones
// not meant to be run under normal circumstances
// only used for cases where the test runner is not able to kill the process
// eg debugging the e2e infra itself
// const cleanupOldProcesses = async () => {
//   const apps = (await stateFile.getLongRunningApps()) || {};
//   const pids = Object.values(apps).map(app => app.pid);
//   pids.forEach(pid => {
//     console.log('Killing old process', pid);
//     treekill(pid, 'SIGKILL');
//   });
// };
