import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

/**
 * Tests MemoryTokenCache cross-tab token sharing via BroadcastChannel
 *
 * This suite validates that when multiple browser tabs share the same user session,
 * token fetches in one tab are automatically broadcast and cached in other tabs,
 * eliminating redundant network requests.
 */
testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })(
  'MemoryTokenCache Multi-Tab Integration @generic',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser({
        withPhoneNumber: true,
        withUsername: true,
      });
      await u.services.users.createBapiUser(fakeUser);
    });

    test.afterAll(async () => {
      await fakeUser.deleteIfExists();
      await app.teardown();
    });

    /**
     * Test Flow:
     * 1. Open two tabs with the same browser context (shared cookies)
     * 2. Sign in on tab1, which creates a session
     * 3. Reload tab2 to pick up the session from cookies
     * 4. Clear token cache on both tabs
     * 5. Fetch token on tab1 (triggers network request + broadcast)
     * 6. Fetch token on tab2 (should use broadcasted token, no network request)
     *
     * Expected Behavior:
     * - Both tabs receive identical tokens
     * - Only ONE network request is made (from tab1)
     * - Tab2 gets the token via BroadcastChannel, proving cross-tab cache sharing
     */
    test('MemoryTokenCache multi-tab token sharing', async ({ context }) => {
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      await page1.goto(app.serverUrl);
      await page2.goto(app.serverUrl);

      await page1.waitForFunction(() => (window as any).Clerk?.loaded);
      await page2.waitForFunction(() => (window as any).Clerk?.loaded);

      const u1 = createTestUtils({ app, page: page1 });
      await u1.po.signIn.goTo();
      await u1.po.signIn.setIdentifier(fakeUser.email);
      await u1.po.signIn.continue();
      await u1.po.signIn.setPassword(fakeUser.password);
      await u1.po.signIn.continue();
      await u1.po.expect.toBeSignedIn();

      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page1.waitForTimeout(1000);

      await page2.reload();
      await page2.waitForFunction(() => (window as any).Clerk?.loaded);

      const u2 = createTestUtils({ app, page: page2 });
      await u2.po.expect.toBeSignedIn();

      const page1SessionInfo = await page1.evaluate(() => {
        const clerk = (window as any).Clerk;
        return {
          sessionId: clerk?.session?.id,
          userId: clerk?.user?.id,
        };
      });

      expect(page1SessionInfo.sessionId).toBeDefined();
      expect(page1SessionInfo.userId).toBeDefined();

      await Promise.all([
        page1.evaluate(() => (window as any).Clerk.session?.clearCache()),
        page2.evaluate(() => (window as any).Clerk.session?.clearCache()),
      ]);

      // Track token fetch requests to verify only one network call happens
      const tokenRequests: string[] = [];
      await context.route('**/v1/client/sessions/*/tokens*', async route => {
        tokenRequests.push(route.request().url());
        await route.continue();
      });

      const page1Token = await page1.evaluate(async () => {
        const clerk = (window as any).Clerk;
        return await clerk.session?.getToken({ skipCache: true });
      });

      expect(page1Token).toBeTruthy();

      // Wait for broadcast to propagate between tabs (broadcast is nearly instant, but we add buffer)
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page2.waitForTimeout(2000);

      const page2Result = await page2.evaluate(async () => {
        const clerk = (window as any).Clerk;

        const token = await clerk.session?.getToken();

        return {
          sessionId: clerk?.session?.id,
          token,
          userId: clerk?.user?.id,
        };
      });

      expect(page2Result.sessionId).toBe(page1SessionInfo.sessionId);
      expect(page2Result.userId).toBe(page1SessionInfo.userId);

      // If BroadcastChannel worked, both tabs should have the EXACT same token
      expect(page2Result.token).toBe(page1Token);

      // Verify only one token fetch happened (page1), proving page2 got it from BroadcastChannel
      expect(tokenRequests.length).toBe(1);
    });
  },
);
