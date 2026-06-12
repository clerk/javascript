import * as path from 'node:path';

import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { _electron as electron, test as base } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { run } from '../../scripts';
import { setupClerkTestingEnv } from '../chrome-extension/helpers';

type WorkerFixtures = {
  testApp: Application;
};

type TestFixtures = {
  electronApplication: ElectronApplication;
  electronPage: Page;
};

const electronExecutable = (app: Application) =>
  path.resolve(app.appDir, 'node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron');

export const test = base.extend<TestFixtures, WorkerFixtures>({
  testApp: [
    async ({}, use) => {
      const env = appConfigs.envs.withEmailCodes;
      const app = await appConfigs.electron.vite.commit();

      await app.withEnv(env);
      await app.setup();
      // pkglab installs with scripts disabled, so install Electron's binary explicitly.
      await run('node node_modules/electron/install.js', { cwd: app.appDir });
      await app.build();
      await setupClerkTestingEnv(env);

      await use(app);
      await app.teardown();
    },
    { scope: 'worker', timeout: 120_000 },
  ],

  electronApplication: async ({ testApp }, use) => {
    const application = await electron.launch({
      args: [path.resolve(testApp.appDir, 'main.mjs')],
      cwd: testApp.appDir,
      executablePath: electronExecutable(testApp),
    });

    await use(application);
    await application.close();
  },

  electronPage: async ({ electronApplication }, use) => {
    const page = await electronApplication.firstWindow();
    await setupClerkTestingToken({ context: page.context() });
    await page.reload();
    await use(page);
  },
});

export { expect } from '@playwright/test';
