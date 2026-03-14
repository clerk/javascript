import { createClerkClient as backendCreateClerkClient } from '@clerk/backend';
import { parsePublishableKey } from '@clerk/shared/keys';
import { clerkSetup, setupClerkTestingToken } from '@clerk/testing/playwright';
import { chromium } from '@playwright/test';
import type { BrowserContext } from '@playwright/test';

import type { EnvironmentConfig } from '../../models/environment';
import { createUserService } from '../../testUtils/usersService';
import type { FakeUser } from '../../testUtils/usersService';

/**
 * Query the background service worker for auth state via chrome.runtime.sendMessage.
 */
export function getAuthFromBackground(
  page: import('@playwright/test').Page,
): Promise<{ userId: string | null; sessionId: string | null }> {
  return page.evaluate(() => {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ type: 'GET_AUTH' }, (response: any) => {
        resolve(response);
      });
    });
  });
}

/**
 * Set up Clerk testing environment (clerkSetup) for extension tests that use build() instead of dev().
 */
export async function setupClerkTestingEnv(env: EnvironmentConfig) {
  const publishableKey = env.publicVariables.get('CLERK_PUBLISHABLE_KEY');
  const secretKey = env.privateVariables.get('CLERK_SECRET_KEY');
  const apiUrl = env.privateVariables.get('CLERK_API_URL');

  if (publishableKey && secretKey) {
    const parsed = parsePublishableKey(publishableKey);
    const frontendApiUrl = parsed?.frontendApi;
    await clerkSetup({
      publishableKey,
      frontendApiUrl,
      secretKey,
      // @ts-expect-error apiUrl is accepted at runtime
      apiUrl,
      dotenv: false,
    });
  }
}

/**
 * Launch a persistent Chromium context with a Chrome extension loaded.
 */
export async function launchExtensionContext(extensionDistPath: string, opts?: { bypassCSP?: boolean }) {
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    bypassCSP: opts?.bypassCSP,
    args: [
      '--headless=new',
      `--disable-extensions-except=${extensionDistPath}`,
      `--load-extension=${extensionDistPath}`,
    ],
  });

  await setupClerkTestingToken({ context });
  return context;
}

/**
 * Extract the extension ID from the service worker registered in the browser context.
 */
export async function getExtensionId(context: BrowserContext) {
  let [background] = context.serviceWorkers();
  if (!background) {
    background = await context.waitForEvent('serviceworker');
  }
  // Service worker URL: chrome-extension://<id>/background.js
  return background.url().split('/')[2];
}

/**
 * Create a fake user from an env config and register it via the Backend API.
 */
export async function createTestUser(env: EnvironmentConfig): Promise<FakeUser> {
  const clerkClient = backendCreateClerkClient({
    apiUrl: env.privateVariables.get('CLERK_API_URL'),
    secretKey: env.privateVariables.get('CLERK_SECRET_KEY'),
    publishableKey: env.publicVariables.get('CLERK_PUBLISHABLE_KEY'),
  });
  const users = createUserService(clerkClient);
  const fakeUser = users.createFakeUser();
  await users.createBapiUser(fakeUser);
  return fakeUser;
}
