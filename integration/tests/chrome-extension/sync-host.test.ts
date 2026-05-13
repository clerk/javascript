import * as path from 'node:path';

import { clerk } from '@clerk/testing/playwright';
import type { BrowserContext, Page } from '@playwright/test';
import { test as base, expect } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils/usersService';
import { createTestUser, getExtensionId, launchExtensionContext, setupClerkTestingEnv } from './helpers';

const env = appConfigs.envs.withEmailCodes;

type SyncHostWorkerFixtures = {
  syncHostSetup: { extensionDistPath: string; hostServerUrl: string };
};

type SyncHostFixtures = {
  context: BrowserContext;
  extensionId: string;
  extensionPage: Page;
  hostPage: Page;
};

/**
 * Sync-host test: verifies the extension can sync auth state from a host web app.
 * Requires both a host web app running + the extension built with syncHost configured.
 */
const test = base.extend<SyncHostFixtures, SyncHostWorkerFixtures>({
  // Worker-scoped: start host app, build extension with syncHost, set up testing tokens
  syncHostSetup: [
    async ({}, use) => {
      // 1. Start the host web app (react-vite)
      // Use env without pkglab JS/UI URLs so the host app loads Clerk from CDN
      const hostEnv = env
        .clone()
        .setEnvVariable('public', 'CLERK_JS_URL', '')
        .setEnvVariable('public', 'CLERK_UI_URL', '');
      const hostConfig = appConfigs.react.vite;
      const hostApp = await hostConfig.commit();
      await hostApp.withEnv(hostEnv);
      await hostApp.setup();
      const { serverUrl: hostServerUrl } = await hostApp.dev();

      // 2. Build the extension with syncHost pointing to the host app
      const extConfig = appConfigs.chromeExtension.vite
        .clone()
        .setName('chrome-extension-vite-sync')
        .addFile(
          'src/popup.tsx',
          () => `
import { ClerkProvider, Show, SignIn, UserButton, useAuth } from '@clerk/chrome-extension';
import React from 'react';
import ReactDOM from 'react-dom/client';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
const SYNC_HOST = import.meta.env.VITE_CLERK_SYNC_HOST as string;

function App() {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      syncHost={SYNC_HOST}
      routerPush={() => {}}
      routerReplace={() => {}}
    >
      <main>
        <Show when='signed-out'>
          <SignIn />
        </Show>
        <Show when='signed-in'>
          <UserButton />
          <AuthInfo />
        </Show>
      </main>
    </ClerkProvider>
  );
}

function AuthInfo() {
  const { userId, sessionId } = useAuth();
  return (
    <div>
      <p data-testid='user-id'>{userId}</p>
      <p data-testid='session-id'>{sessionId}</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`,
        );

      const syncEnv = env.clone().setEnvVariable('public', 'CLERK_SYNC_HOST', hostServerUrl);
      const extApp = await extConfig.commit();
      await extApp.withEnv(syncEnv);
      await extApp.setup();
      await extApp.build();

      const extensionDistPath = path.resolve(extApp.appDir, 'dist');

      await setupClerkTestingEnv(env);

      await use({ extensionDistPath, hostServerUrl });

      await Promise.all([hostApp.teardown(), extApp.teardown()]);
    },
    { scope: 'worker', timeout: 180_000 },
  ],

  context: async ({ syncHostSetup }, use) => {
    const context = await launchExtensionContext(syncHostSetup.extensionDistPath);
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

  hostPage: async ({ context, syncHostSetup }, use) => {
    const page = await context.newPage();
    await page.goto(`${syncHostSetup.hostServerUrl}/sign-in`);
    await use(page);
    await page.close();
  },
});

test.describe('chrome extension sync-host @chrome-extension', () => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    fakeUser = await createTestUser(env);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
  });

  test('extension picks up session from host web app via syncHost', async ({ hostPage, extensionPage }) => {
    // Sign in on the host web app via SDK
    await clerk.signIn({
      page: hostPage,
      signInParams: { strategy: 'password', identifier: fakeUser.email, password: fakeUser.password },
    });

    // Reload the extension popup to pick up the synced session from the host
    await extensionPage.reload();

    // The extension should detect the session from the host and show signed-in state
    await extensionPage.waitForSelector('[data-testid="user-id"]', { timeout: 30_000 });

    const userId = await extensionPage.locator('[data-testid="user-id"]').textContent();
    expect(userId).toBeTruthy();
    expect(userId).toMatch(/^user_/);
  });
});
