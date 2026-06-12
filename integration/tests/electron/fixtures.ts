import * as path from 'node:path';

import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { _electron as electron, test as base } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { run } from '../../scripts';
import { createTestUtils } from '../../testUtils';
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
const ELECTRON_RENDERER_ORIGIN = 'clerk://app';

async function addElectronRendererAllowedOrigin(app: Application) {
  const u = createTestUtils({ app });
  const instance = await u.services.clerk.instance.get();
  const allowedOrigins = new Set(instance.allowedOrigins ?? []);
  allowedOrigins.add(ELECTRON_RENDERER_ORIGIN);

  const publishableKey = app.env.publicVariables.get('CLERK_PUBLISHABLE_KEY');
  const apiUrl = app.env.privateVariables.get('CLERK_API_URL') || apiUrlFromPublishableKey(publishableKey);
  const secretKey = app.env.privateVariables.get('CLERK_SECRET_KEY');
  const res = await fetch(`${apiUrl}/v1/instance`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Clerk-API-Version': '2026-05-12',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ allowed_origins: Array.from(allowedOrigins) }),
  });

  if (!res.ok) {
    throw new Error(`Failed to add Electron allowed origin: ${res.status} ${await res.text()}`);
  }
}

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
      await addElectronRendererAllowedOrigin(app);

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
