import * as path from 'node:path';

import { parsePublishableKey } from '@clerk/shared/keys';
import { clerkSetup, setupClerkTestingToken } from '@clerk/testing/playwright';
import type { ElectronApplication, Page } from '@playwright/test';
import { _electron as electron, test as base } from '@playwright/test';

import type { Application } from '../../models/application';
import type { EnvironmentConfig } from '../../models/environment';
import { appConfigs } from '../../presets';
import { run } from '../../scripts';

type WorkerFixtures = {
  electronTestApp: Application;
};

type TestFixtures = {
  electronApplication: ElectronApplication;
  electronPage: Page;
};

const electronExecutable = (app: Application) =>
  path.resolve(app.appDir, 'node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron');

async function setupClerkTestingEnv(env: EnvironmentConfig) {
  const publishableKey = env.publicVariables.get('CLERK_PUBLISHABLE_KEY');
  const secretKey = env.privateVariables.get('CLERK_SECRET_KEY');
  const apiUrl = env.privateVariables.get('CLERK_API_URL');

  if (!publishableKey || !secretKey) {
    throw new Error('Missing Clerk integration keys for Electron E2E tests');
  }

  const { frontendApi: frontendApiUrl, instanceType } = parsePublishableKey(publishableKey, { fatal: true });

  if (instanceType !== 'development') {
    return;
  }

  await clerkSetup({
    publishableKey,
    frontendApiUrl,
    secretKey,
    // @ts-expect-error apiUrl is accepted at runtime.
    apiUrl,
    dotenv: false,
  });
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  electronTestApp: [
    async ({}, provide) => {
      const env = appConfigs.envs.withEmailCodes;
      const app = await appConfigs.electron.vite.commit();

      await app.withEnv(env);
      await app.setup();
      await run('node node_modules/electron/install.js', { cwd: app.appDir });
      await app.build();
      await setupClerkTestingEnv(env);

      await provide(app);
      await app.teardown();
    },
    { scope: 'worker', timeout: 120_000 },
  ],

  electronApplication: async ({ electronTestApp }, provide) => {
    const application = await electron.launch({
      args: [path.resolve(electronTestApp.appDir, 'main.mjs')],
      cwd: electronTestApp.appDir,
      executablePath: electronExecutable(electronTestApp),
    });

    await provide(application);
    await application.close();
  },

  electronPage: async ({ electronApplication }, provide) => {
    const page = await electronApplication.firstWindow();
    await setupClerkTestingToken({ context: page.context() });
    await page.reload();
    await provide(page);
  },
});

export { expect } from '@playwright/test';
