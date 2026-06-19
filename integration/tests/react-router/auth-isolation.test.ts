import { expect, test, type Page } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

// Regression guard for the cross-user auth bleed. The app under test runs a custom server that
// shares ONE RouterContextProvider across every request. Pre-fix, @clerk/react-router cached
// resolved auth on that shared context, so a request that paused in its loader could read a
// concurrent request's identity. getAuth now keys auth by the per-request Request, so a delayed
// request must still resolve to its own user even after another user overwrites the context.
testAgainstRunningApps({
  withEnv: [appConfigs.envs.withEmailCodes],
  withPattern: ['react-router.node-shared-context'],
})('cross-user auth isolation under a shared context for @react-router', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let userA: FakeUser;
  let userB: FakeUser;
  let userAId: string;
  let userBId: string;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    userA = u.services.users.createFakeUser({ fictionalEmail: true });
    userB = u.services.users.createFakeUser({ fictionalEmail: true });
    userAId = (await u.services.users.createBapiUser(userA)).id;
    userBId = (await u.services.users.createBapiUser(userB)).id;
  });

  test.afterAll(async () => {
    await userA?.deleteIfExists();
    await userB?.deleteIfExists();
  });

  test('a delayed request keeps its own identity while a concurrent user overwrites the context', async ({
    browser,
  }) => {
    test.setTimeout(120_000);

    // Sign each user in inside its own browser context so we keep two independent cookie jars.
    const signIn = async (user: FakeUser) => {
      const context = await browser.newContext();
      try {
        const page = await context.newPage();
        const u = createTestUtils({ app, page, context });
        await u.po.signIn.goTo();
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: user.email, password: user.password });
        await u.po.expect.toBeSignedIn();
        return { context, page };
      } catch (error) {
        await context.close();
        throw error;
      }
    };

    // page.request reuses that page's session cookie, so each call authenticates as its user.
    const fetchUserId = async (page: Page, delayMs: number) => {
      const url = new URL(`/api/me?delay=${delayMs}`, app.serverUrl).toString();
      const res = await page.request.get(url);
      // Check status before parsing so a 307 handshake or 500 surfaces as a status failure.
      expect(res.status(), `GET /api/me?delay=${delayMs} should be 200`).toBe(200);
      return (await res.json()).userId as string | null;
    };

    const [a, b] = await Promise.all([signIn(userA), signIn(userB)]);

    try {
      // Each round forces the interleaving that caused the bleed: A's loader pauses (after its
      // middleware wrote auth onto the shared context), B resolves during that pause and
      // overwrites the shared context to B, then A reads. A must still resolve to A. Pre-fix A
      // read the overwritten context and returned B.
      for (let round = 0; round < 5; round++) {
        const aId = fetchUserId(a.page, 1500);
        await new Promise(resolve => setTimeout(resolve, 250)); // let A reach the loader pause
        const bId = fetchUserId(b.page, 0);

        expect(await bId).toBe(userBId);
        expect(await aId).toBe(userAId);
      }
    } finally {
      await a.context.close();
      await b.context.close();
    }
  });
});
