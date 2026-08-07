import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

/**
 * Tests MemoryTokenCache session isolation in multi-session scenarios
 *
 * This suite validates that when multiple user sessions exist simultaneously,
 * each session maintains its own isolated token cache. Tokens are not shared
 * between different sessions, even within the same tab, ensuring proper
 * security boundaries between users.
 */
testAgainstRunningApps({ withEnv: [appConfigs.envs.withSessionTasks] })(
  'MemoryTokenCache Multi-Session Integration @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser1: FakeUser;
    let fakeUser2: FakeUser;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      fakeUser1 = u.services.users.createFakeUser();
      fakeUser2 = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser1);
      await u.services.users.createBapiUser(fakeUser2);
    });

    test.afterAll(async () => {
      await fakeUser1.deleteIfExists();
      await fakeUser2.deleteIfExists();
      await app.teardown();
    });

    /**
     * Test Flow:
     * 1. Tab1: Sign in as user1, fetch and cache their token
     * 2. Tab2: Opens and inherits user1's session via cookies
     * 3. Tab2: Sign in as user2 using programmatic sign-in (preserves both sessions)
     * 4. Tab2: Now has two active sessions (user1 and user2)
     * 5. Tab2: Switch between sessions and fetch tokens for each
     * 6. Verify no network requests occur (tokens served from cache)
     * 7. Tab1: Verify it still has user1 as active session (tab independence)
     *
     * Expected Behavior:
     * - Each session has its own isolated token cache
     * - Switching sessions in tab2 returns different tokens
     * - Both tokens are served from cache (no network requests)
     * - Tab1 remains unaffected by tab2's session changes
     * - Multi-session state is properly maintained per-tab
     */
    test('MemoryTokenCache multi-session - multiple users in different tabs with separate token caches', async ({
      context,
    }) => {
      const page1 = await context.newPage();
      await page1.goto(app.serverUrl);
      await page1.waitForFunction(() => (window as any).Clerk?.loaded);

      const u1 = createTestUtils({ app, page: page1 });
      await u1.po.signIn.goTo();
      await u1.po.signIn.setIdentifier(fakeUser1.email);
      await u1.po.signIn.continue();
      await u1.po.signIn.setPassword(fakeUser1.password);
      await u1.po.signIn.continue();
      await u1.po.expect.toBeSignedIn();

      const user1SessionInfo = await page1.evaluate(() => {
        const clerk = (window as any).Clerk;
        return {
          sessionId: clerk?.session?.id,
          userId: clerk?.user?.id,
        };
      });

      expect(user1SessionInfo.sessionId).toBeDefined();
      expect(user1SessionInfo.userId).toBeDefined();

      const user1Token = await page1.evaluate(async () => {
        const clerk = (window as any).Clerk;
        return await clerk.session?.getToken({ skipCache: true });
      });

      expect(user1Token).toBeTruthy();

      const page2 = await context.newPage();
      await page2.goto(app.serverUrl);
      await page2.waitForFunction(() => (window as any).Clerk?.loaded);

      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page2.waitForTimeout(1000);

      const u2 = createTestUtils({ app, page: page2 });
      await u2.po.expect.toBeSignedIn();

      const page2User1SessionInfo = await page2.evaluate(() => {
        const clerk = (window as any).Clerk;
        return {
          sessionId: clerk?.session?.id,
          userId: clerk?.user?.id,
        };
      });

      expect(page2User1SessionInfo.userId).toBe(user1SessionInfo.userId);
      expect(page2User1SessionInfo.sessionId).toBe(user1SessionInfo.sessionId);

      // Use clerk.client.signIn.create() instead of navigating to /sign-in
      // because navigating replaces the session by default (transferable: true)
      const signInResult = await page2.evaluate(
        async ({ email, password }) => {
          const clerk = (window as any).Clerk;

          try {
            const signIn = await clerk.client.signIn.create({
              identifier: email,
              password: password,
            });

            await clerk.setActive({
              session: signIn.createdSessionId,
            });

            return {
              allSessions: clerk?.client?.sessions?.map((s: any) => ({ id: s.id, userId: s.userId })) || [],
              sessionCount: clerk?.client?.sessions?.length || 0,
              success: true,
            };
          } catch (error: any) {
            return {
              error: error.message || String(error),
              success: false,
            };
          }
        },
        { email: fakeUser2.email, password: fakeUser2.password },
      );

      expect(signInResult.success).toBe(true);
      expect(signInResult.sessionCount).toBe(2);

      await u2.po.expect.toBeSignedIn();

      const user2SessionInfo = await page2.evaluate(() => {
        const clerk = (window as any).Clerk;
        return {
          allSessions: clerk?.client?.sessions?.map((s: any) => ({ id: s.id, userId: s.userId })) || [],
          sessionCount: clerk?.client?.sessions?.length || 0,
          sessionId: clerk?.session?.id,
          userId: clerk?.user?.id,
        };
      });

      expect(user2SessionInfo.sessionId).toBeDefined();
      expect(user2SessionInfo.userId).toBeDefined();
      expect(user2SessionInfo.sessionId).not.toBe(user1SessionInfo.sessionId);
      expect(user2SessionInfo.userId).not.toBe(user1SessionInfo.userId);

      const user2Token = await page2.evaluate(async () => {
        const clerk = (window as any).Clerk;
        return await clerk.session?.getToken({ skipCache: true });
      });

      expect(user2Token).toBeTruthy();
      expect(user2Token).not.toBe(user1Token);

      const page2MultiSessionInfo = await page2.evaluate(() => {
        const clerk = (window as any).Clerk;
        return {
          activeSessionId: clerk?.session?.id,
          allSessionIds: clerk?.client?.sessions?.map((s: any) => s.id) || [],
          sessionCount: clerk?.client?.sessions?.length || 0,
        };
      });

      expect(page2MultiSessionInfo.sessionCount).toBe(2);
      expect(page2MultiSessionInfo.allSessionIds).toContain(user1SessionInfo.sessionId);
      expect(page2MultiSessionInfo.allSessionIds).toContain(user2SessionInfo.sessionId);
      expect(page2MultiSessionInfo.activeSessionId).toBe(user2SessionInfo.sessionId);

      const tokenFetchRequests: Array<{ sessionId: string; url: string }> = [];
      await context.route('**/v1/client/sessions/*/tokens*', async route => {
        const url = route.request().url();
        const sessionIdMatch = url.match(/sessions\/([^/]+)\/tokens/);
        const sessionId = sessionIdMatch?.[1] || 'unknown';
        tokenFetchRequests.push({ sessionId, url });
        await route.continue();
      });

      const tokenIsolation = await page2.evaluate(
        async ({ user1SessionId, user2SessionId }) => {
          const clerk = (window as any).Clerk;

          await clerk.setActive({ session: user1SessionId });
          const user1Token = await clerk.session?.getToken();

          await clerk.setActive({ session: user2SessionId });
          const user2Token = await clerk.session?.getToken();

          return {
            tokensAreDifferent: user1Token !== user2Token,
            user1Token,
            user2Token,
          };
        },
        { user1SessionId: user1SessionInfo.sessionId, user2SessionId: user2SessionInfo.sessionId },
      );

      expect(tokenIsolation.tokensAreDifferent).toBe(true);
      expect(tokenIsolation.user1Token).toBeTruthy();
      expect(tokenIsolation.user2Token).toBeTruthy();
      expect(tokenFetchRequests.length).toBe(0);

      await context.unroute('**/v1/client/sessions/*/tokens*');

      // In multi-session apps, each tab can have a different active session
      const tab1FinalInfo = await page1.evaluate(() => {
        const clerk = (window as any).Clerk;
        return {
          activeSessionId: clerk?.session?.id,
          userId: clerk?.user?.id,
        };
      });

      // Tab1 should STILL have user1 as the active session (independent per tab)
      expect(tab1FinalInfo.userId).toBe(user1SessionInfo.userId);
      expect(tab1FinalInfo.activeSessionId).toBe(user1SessionInfo.sessionId);
    });

    /**
     * Test Flow:
     * 1. Tab1: Sign in as user1
     * 2. Tab2: Inherits user1's session, then signs in as user2 (multi-session)
     * 3. Tab1 has user1's active session; tab2 has user2's active session
     * 4. Each tab's active session independently hydrates its token cache
     * 5. Start counting /tokens requests, wait for both refresh timers to fire
     * 6. Assert exactly 2 /tokens requests (one per session), with each session
     *    represented exactly once
     *
     * Expected Behavior:
     * - Two different sessions produce two independent refresh requests
     * - BroadcastChannel does NOT deduplicate across sessions (different tokenIds)
     * - Each session refreshes exactly once
     *
     * Note that this test does not currently assert in which tab the updates happen,
     * this might be something we want to add in the future, but currently it is not
     * deterministic.
     */
    test('cross-session token refreshes do not deduplicate', async ({ context }) => {
      const page1 = await context.newPage();
      await page1.goto(app.serverUrl);
      await page1.waitForFunction(() => (window as any).Clerk?.loaded);

      const u1 = createTestUtils({ app, page: page1 });
      await u1.po.signIn.goTo();
      await u1.po.signIn.setIdentifier(fakeUser1.email);
      await u1.po.signIn.continue();
      await u1.po.signIn.setPassword(fakeUser1.password);
      await u1.po.signIn.continue();
      await u1.po.expect.toBeSignedIn();

      const user1SessionId = await page1.evaluate(() => (window as any).Clerk?.session?.id);
      expect(user1SessionId).toBeDefined();

      const page2 = await context.newPage();
      await page2.goto(app.serverUrl);
      await page2.waitForFunction(() => (window as any).Clerk?.loaded);

      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page2.waitForTimeout(1000);

      const u2 = createTestUtils({ app, page: page2 });
      await u2.po.expect.toBeSignedIn();

      // Sign in as user2 on tab2, creating a second session
      const signInResult = await page2.evaluate(
        async ({ email, password }) => {
          const clerk = (window as any).Clerk;
          const signIn = await clerk.client.signIn.create({ identifier: email, password });
          await clerk.setActive({ session: signIn.createdSessionId });
          return {
            sessionCount: clerk?.client?.sessions?.length || 0,
            sessionId: clerk?.session?.id,
            success: true,
          };
        },
        { email: fakeUser2.email, password: fakeUser2.password },
      );

      expect(signInResult.success).toBe(true);
      expect(signInResult.sessionCount).toBe(2);

      const user2SessionId = signInResult.sessionId;
      expect(user2SessionId).toBeDefined();
      expect(user2SessionId).not.toBe(user1SessionId);

      // Tab1 has user1's active session; tab2 has user2's active session.
      // Start counting /tokens requests from here on.
      const refreshRequests: Array<{ sessionId: string; url: string }> = [];
      await context.route('**/v1/client/sessions/*/tokens*', async route => {
        const url = route.request().url();
        const match = url.match(/sessions\/([^/]+)\/tokens/);
        refreshRequests.push({ sessionId: match?.[1] || 'unknown', url });
        await route.continue();
      });

      // Manually trigger a fresh /tokens fetch on each tab. Because the two
      // tabs hold different sessions (different tokenIds), BroadcastChannel
      // does NOT deduplicate across them — each tab is expected to make its
      // own request.
      const [page1Token, page2Token] = await Promise.all([
        page1.evaluate(() => (window as any).Clerk.session?.getToken({ skipCache: true })),
        page2.evaluate(() => (window as any).Clerk.session?.getToken({ skipCache: true })),
      ]);

      // Allow both broadcasts to settle.
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page1.waitForTimeout(500);

      expect(refreshRequests.length).toBe(2);

      const refreshedSessionIds = new Set(refreshRequests.map(r => r.sessionId));
      expect(refreshedSessionIds.has(user1SessionId)).toBe(true);
      expect(refreshedSessionIds.has(user2SessionId)).toBe(true);

      // Both tabs should hold valid, distinct tokens (different sessions).
      expect(page1Token).toBeTruthy();
      expect(page2Token).toBeTruthy();
      expect(page1Token).not.toBe(page2Token);
    });
  },
);
