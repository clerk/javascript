import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })(
  'offline session persistence @generic',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser);
    });

    test.afterAll(async () => {
      await fakeUser.deleteIfExists();
      await app.teardown();
    });

    test('user remains signed in after token endpoint outage and recovery', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });
      await u.po.expect.toBeSignedIn();

      const initialToken = await page.evaluate(() => window.Clerk?.session?.getToken());
      expect(initialToken).toBeTruthy();

      // Simulate token endpoint outage — requests will fail with network error
      await page.route('**/v1/client/sessions/*/tokens**', route => route.abort('failed'));

      // Clear token cache so any subsequent internal refresh hits the failing endpoint
      await page.evaluate(() => window.Clerk?.session?.clearCache());

      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(3_000);

      // Restore network
      await page.unrouteAll();

      // The session cookie must NOT have been removed during the outage.
      // Before the fix, empty tokens would be dispatched to AuthCookieService,
      // which interpreted them as sign-out and removed the __session cookie.
      await u.po.expect.toBeSignedIn();

      // Verify recovery: a fresh token can still be obtained
      const recoveredToken = await page.evaluate(() => window.Clerk?.session?.getToken());
      expect(recoveredToken).toBeTruthy();
    });

    test('session survives page reload after token endpoint outage', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });
      await u.po.expect.toBeSignedIn();

      // Fail all token refresh requests
      await page.route('**/v1/client/sessions/*/tokens**', route => route.abort('failed'));

      // Force a refresh attempt that will fail
      await page.evaluate(() => window.Clerk?.session?.clearCache());

      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(2_000);

      // Restore network before reload
      await page.unrouteAll();

      // Reload the page — if the __session cookie was removed during the outage,
      // the server would treat this as an unauthenticated request
      await page.reload();
      await u.po.clerk.toBeLoaded();

      await u.po.expect.toBeSignedIn();
    });

    test('session cookie persists when browser goes fully offline and recovers', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });
      await u.po.expect.toBeSignedIn();

      // Go fully offline — sets navigator.onLine to false,
      // which triggers the isBrowserOnline() guard in _getToken
      await context.setOffline(true);

      // Clear token cache while offline
      await page.evaluate(() => window.Clerk?.session?.clearCache());

      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(2_000);

      // Come back online
      await context.setOffline(false);

      // Reload — session cookie must still be intact
      await page.reload();
      await u.po.clerk.toBeLoaded();

      await u.po.expect.toBeSignedIn();

      // Confirm a fresh token can be obtained after recovery
      const token = await page.evaluate(() => window.Clerk?.session?.getToken());
      expect(token).toBeTruthy();
    });
  },
);
