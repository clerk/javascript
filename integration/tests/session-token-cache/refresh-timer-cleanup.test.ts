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
 * Additionally, the proactive refresh timer's onRefresh callback also calls set() after
 * fetching a new token. Without proper timer cleanup, each set() call would leave the
 * previous refresh timer running, causing the effective polling rate to accelerate over
 * time as orphaned timers accumulate.
 *
 * These tests verify that token refresh requests maintain a stable, predictable rate
 * even after operations (like touch or org switching) that trigger multiple set() calls.
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

    test('token refresh rate remains stable after session.touch() triggers _updateClient', async ({
      page,
      context,
    }) => {
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

      // Trigger multiple touch() calls to simulate the scenario where _updateClient
      // causes Session reconstruction → #hydrateCache → set(), potentially leaking timers
      for (let i = 0; i < 3; i++) {
        await page.evaluate(async () => {
          await (window as any).Clerk?.session?.touch();
        });
      }

      // Wait long enough for multiple refresh cycles (tokens have ~60s TTL,
      // refresh fires at ~43s). We wait 90s to see at least 2 refresh cycles.
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(90_000);

      await page.unrouteAll();

      // With the fix: ~2-3 refresh requests over 90s (one every ~43s)
      // Without the fix: 6+ requests as orphaned timers from each touch() accumulate
      // (3 touch calls × 2 set() calls each = 6 timer chains all firing independently)
      //
      // We allow up to 5 to account for the initial token fetch + normal refresh cycles
      expect(tokenRequests.length).toBeLessThanOrEqual(5);

      // Verify requests are reasonably spaced (not clustering together)
      if (tokenRequests.length >= 2) {
        for (let i = 1; i < tokenRequests.length; i++) {
          const gap = tokenRequests[i] - tokenRequests[i - 1];
          // Each gap should be at least 10 seconds — if timers were accumulating,
          // we'd see requests firing within seconds of each other
          expect(gap).toBeGreaterThan(10_000);
        }
      }
    });
  },
);
