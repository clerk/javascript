import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

/**
 * Tests that the token cache's proactive refresh timer does not accumulate
 * orphaned timers across set() calls.
 *
 * Background: Every API response that piggybacks client data triggers _updateClient,
 * which reconstructs Session objects and calls #hydrateCache → SessionTokenCache.set().
 * Without proper timer cleanup, each set() call would leave the previous refresh timer
 * running, causing the effective polling rate to accelerate over time.
 */
testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })(
  'Token refresh timer cleanup @generic',
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

    test('touch does not cause clustered token refresh requests', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();

      // Track token fetch requests with timestamps
      const tokenRequests: number[] = [];
      await page.route('**/v1/client/sessions/*/tokens**', async route => {
        tokenRequests.push(Date.now());
        await route.continue();
      });

      // Trigger multiple touch() calls — each causes _updateClient → Session constructor
      // → #hydrateCache → set(), which previously leaked orphaned refresh timers
      for (let i = 0; i < 5; i++) {
        await page.evaluate(async () => {
          await (window as any).Clerk?.session?.touch();
        });
      }

      // Wait 50s — enough for one refresh cycle (~43s) but not two
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(50_000);

      await page.unrouteAll();

      // With the fix: at most 1-2 refresh requests (one cycle at ~43s)
      // Without the fix: 5+ requests from orphaned timers all firing at different offsets
      expect(tokenRequests.length).toBeLessThanOrEqual(3);

      // If multiple requests occurred, verify they aren't clustered together
      // (clustering = orphaned timers firing near-simultaneously)
      if (tokenRequests.length >= 2) {
        for (let i = 1; i < tokenRequests.length; i++) {
          const gap = tokenRequests[i] - tokenRequests[i - 1];
          expect(gap).toBeGreaterThan(10_000);
        }
      }
    });
  },
);
