import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

const ORIGIN_OUTAGE_MODE_OPT_IN_HEADER = 'X-Clerk-Origin-Outage-Mode-Opt-In';

const OPT_IN_HEADER_SECRET = process.env.ORIGIN_OUTAGE_MODE_OPT_IN_SECRET;

function isEdgeGeneratedToken(token: string): boolean {
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  return payload._cs === 'e';
}

testAgainstRunningApps({
  withEnv: [appConfigs.envs.withOutageMode],
})('Frontend - Session Token Refresh (Outage Mode) @outage-mode', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPassword: true,
    });
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser?.deleteIfExists();
  });

  test('token refresh: should get new token from origin in normal mode', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });
    await u.po.expect.toBeSignedIn();

    await page.evaluate(async () => {
      const clerk = (window as any).Clerk;
      if (clerk?.session?.getToken) {
        await clerk.session.getToken({ skipCache: true });
      }
    });

    const refreshedToken = await page.evaluate(() => {
      return (window as any).Clerk?.session?.lastActiveToken?.getRawString();
    });

    expect(refreshedToken).toBeTruthy();
    expect(isEdgeGeneratedToken(refreshedToken as string)).toBe(false);
  });

  test('token refresh: should get new token from proxy with opt-in header', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });
    await u.po.expect.toBeSignedIn();

    await page.route('**/sessions/*/tokens*', async (route, request) => {
      const headers = {
        ...request.headers(),
        [ORIGIN_OUTAGE_MODE_OPT_IN_HEADER]: OPT_IN_HEADER_SECRET,
      };
      await route.continue({ headers });
    });

    await page.evaluate(async () => {
      const clerk = (window as any).Clerk;
      if (clerk?.session?.getToken) {
        await clerk.session.getToken({ skipCache: true });
      }
    });

    await page.unroute('**/sessions/*/tokens*');

    const refreshedToken = await page.evaluate(() => {
      return (window as any).Clerk?.session?.lastActiveToken?.getRawString();
    });

    expect(refreshedToken).toBeTruthy();
    expect(isEdgeGeneratedToken(refreshedToken as string)).toBe(true);
  });
});
