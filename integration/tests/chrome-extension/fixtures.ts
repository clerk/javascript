import * as path from 'node:path';

import type { BrowserContext, Page } from '@playwright/test';
import { test as base } from '@playwright/test';

import type { Application } from '../../models/application';
import type { EnvironmentConfig } from '../../models/environment';
import { appConfigs } from '../../presets';
import { getExtensionId, launchExtensionContext, setupClerkTestingEnv } from './helpers';

type WorkerFixtures = {
  extensionDistPath: string;
  extensionApp: Application;
  extensionEnv: EnvironmentConfig;
  extensionTestingToken: boolean;
};

type TestFixtures = {
  context: BrowserContext;
  extensionId: string;
  extensionPage: Page;
};

/**
 * Custom Playwright test with fixtures for Chrome extension testing.
 *
 * Worker-scoped fixtures build the extension once per worker.
 * Test-scoped fixtures create a fresh persistent context per test.
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  extensionEnv: [appConfigs.envs.withEmailCodes, { scope: 'worker', option: true }],
  extensionTestingToken: [true, { scope: 'worker', option: true }],
  // Worker-scoped: build the extension once and set up testing tokens
  extensionApp: [
    async ({ extensionEnv: env, extensionTestingToken }, use) => {
      const config = appConfigs.chromeExtension.vite;

      const app = await config.commit();
      await app.withEnv(env);
      await app.setup();
      await app.build();

      if (extensionTestingToken) {
        await setupClerkTestingEnv(env);
      }

      await use(app);
      await app.teardown();
    },
    { scope: 'worker', timeout: 120_000 },
  ],

  extensionDistPath: [
    async ({ extensionApp }, use) => {
      const distPath = path.resolve(extensionApp.appDir, 'dist');
      await use(distPath);
    },
    { scope: 'worker' },
  ],

  // Test-scoped: fresh persistent context per test with the extension loaded
  context: async ({ extensionDistPath, extensionTestingToken }, use) => {
    const context = await launchExtensionContext(extensionDistPath, {
      bypassCSP: false,
      testingToken: extensionTestingToken,
    });
    await use(context);
    await context.close();
  },

  extensionId: async ({ context }, use) => {
    const extensionId = await getExtensionId(context);
    await use(extensionId);
  },

  extensionPage: async ({ context, extensionId }, use) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await use(page);
    await page.close();
  },
});

export { expect } from '@playwright/test';
