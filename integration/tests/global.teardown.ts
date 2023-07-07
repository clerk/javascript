import { test as setup } from '@playwright/test';

import { longRunningApps } from '../presets';

setup('teardown long running apps', async () => {
  await Promise.all(
    Object.values(longRunningApps)
      .map(type => Object.values(type))
      .flat()
      .map(app => app.destroy()),
  );
  console.log('Long running apps destroyed');
});
