import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })(
  'multi-session token refresh @nextjs',
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

    test('FAPI token fetch returns correct sid per session', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Sign in user1 via the UI
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser1.email,
        password: fakeUser1.password,
      });
      await u.po.expect.toBeSignedIn();

      const session1Info = await page.evaluate(() => {
        const clerk = (window as any).Clerk;
        return {
          sessionId: clerk.session.id,
          userId: clerk.user.id,
        };
      });

      expect(session1Info.sessionId).toBeDefined();

      // Sign in user2 programmatically to create a second session
      const signInResult = await page.evaluate(
        async ({ email, password }) => {
          const clerk = (window as any).Clerk;
          const signIn = await clerk.client.signIn.create({ identifier: email, password });
          await clerk.setActive({ session: signIn.createdSessionId });
          return {
            sessionCount: clerk.client.sessions.length,
            success: true,
          };
        },
        { email: fakeUser2.email, password: fakeUser2.password },
      );

      expect(signInResult.success).toBe(true);
      expect(signInResult.sessionCount).toBe(2);

      const session2Info = await page.evaluate(() => {
        const clerk = (window as any).Clerk;
        return {
          sessionId: clerk.session.id,
          userId: clerk.user.id,
        };
      });

      expect(session2Info.sessionId).toBeDefined();
      expect(session2Info.sessionId).not.toBe(session1Info.sessionId);

      // Switch to session1, fetch token, decode JWT, assert sid matches session1
      const token1Sid = await page.evaluate(async ({ sessionId }) => {
        const clerk = (window as any).Clerk;
        await clerk.setActive({ session: sessionId });
        const token = await clerk.session.getToken({ skipCache: true });
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sid;
      }, session1Info);

      expect(token1Sid).toBe(session1Info.sessionId);

      // Switch to session2, fetch token, decode JWT, assert sid matches session2
      const token2Sid = await page.evaluate(async ({ sessionId }) => {
        const clerk = (window as any).Clerk;
        await clerk.setActive({ session: sessionId });
        const token = await clerk.session.getToken({ skipCache: true });
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sid;
      }, session2Info);

      expect(token2Sid).toBe(session2Info.sessionId);
    });

    test('server-side refresh preserves correct session after token expiry', async ({ page, context }) => {
      // This test waits ~65s for JWT expiry, so triple the default timeout
      test.slow();

      const u = createTestUtils({ app, page, context });

      // Sign in user1 via the UI
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser1.email,
        password: fakeUser1.password,
      });
      await u.po.expect.toBeSignedIn();

      const session1Info = await page.evaluate(() => {
        const clerk = (window as any).Clerk;
        return {
          sessionId: clerk.session.id,
          userId: clerk.user.id,
        };
      });

      expect(session1Info.sessionId).toBeDefined();

      // Sign in user2 programmatically → session2 becomes "last active"
      await page.evaluate(
        async ({ email, password }) => {
          const clerk = (window as any).Clerk;
          const signIn = await clerk.client.signIn.create({ identifier: email, password });
          await clerk.setActive({ session: signIn.createdSessionId });
        },
        { email: fakeUser2.email, password: fakeUser2.password },
      );

      const session2Info = await page.evaluate(() => {
        const clerk = (window as any).Clerk;
        return {
          sessionId: clerk.session.id,
          userId: clerk.user.id,
        };
      });

      expect(session2Info.sessionId).not.toBe(session1Info.sessionId);

      // Fetch a token for session2 to ensure it's the most recently touched
      await page.evaluate(async () => {
        const clerk = (window as any).Clerk;
        await clerk.session.getToken({ skipCache: true });
      });

      // Switch back to session1 as the active session
      await page.evaluate(async ({ sessionId }) => {
        const clerk = (window as any).Clerk;
        await clerk.setActive({ session: sessionId });
      }, session1Info);

      // Verify we're on session1
      const activeBeforeWait = await page.evaluate(() => {
        const clerk = (window as any).Clerk;
        return clerk.session.id;
      });
      expect(activeBeforeWait).toBe(session1Info.sessionId);

      // Block client-side FAPI token refreshes to prevent the SessionCookiePoller
      // from refreshing the __session cookie before it expires
      await page.route('**/v1/client/sessions/*/tokens*', route => route.abort());

      // Wait ~65s for the JWT in the __session cookie to expire
      // (dev instance token lifetime is 60s)
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(65_000);

      // Remove route interception, then navigate to trigger server-side refresh
      await page.unroute('**/v1/client/sessions/*/tokens*');
      await page.goto(app.serverUrl);

      // Wait for Clerk to be fully loaded after the server-side refresh/handshake
      await page.waitForFunction(() => (window as any).Clerk?.loaded);

      // Assert the active session is still session1, not swapped to session2
      const sessionAfterRefresh = await page.evaluate(() => {
        const clerk = (window as any).Clerk;
        return {
          sessionId: clerk.session?.id,
          userId: clerk.user?.id,
        };
      });

      expect(sessionAfterRefresh.sessionId).toBe(session1Info.sessionId);
      expect(sessionAfterRefresh.userId).toBe(session1Info.userId);
    });
  },
);
