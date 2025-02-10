/**
 * This test ensures that Clerk can still operate in a non-secure context.
 * Especially useful for developing in local environments using custom domains pointing to localhost
 * but without using self-signed certificates.
 *
 * No special requirements are needed for this test to run, as we will not use TLS.
 *
 * The test will:
 * 1. Use a dev instance created from clerkstage.dev
 * 2. Create and run a single app
 * 3. Start a local server that proxies requests to the app running locally
 * 4. Perform a simple sign-in flow
 */

import type { Server } from 'node:http';

import { test } from '@playwright/test';

import { createProxyServer } from '../scripts/proxyServer';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

// This NEEDS to be a domain that points to localhost
// and is not listed in the HSTS preload list
// For more info, refer to https://hstspreload.org/
// and https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
const APP_HOST = 'lclclerk.com';

testAgainstRunningApps({ withPattern: ['next.appRouter.withEmailCodes'] })(
  'localhost non-secure context @generic',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;
    let server: Server;

    test.beforeAll(async () => {
      server = createProxyServer({
        targets: {
          [APP_HOST]: app.serverUrl,
        },
      });

      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser);
    });

    test.afterAll(async () => {
      await Promise.all([await fakeUser.deleteIfExists(), await app.teardown()]);
      server.close();
    });

    test('sign-in flow', async ({ page }) => {
      const u = createTestUtils({ app, page });
      await u.page.goto(`http://${APP_HOST}`);
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword(fakeUser);
      await u.po.expect.toBeSignedIn();
      await page.evaluate(() => window.Clerk.signOut());
      await u.po.expect.toBeSignedOut();
    });
  },
);
