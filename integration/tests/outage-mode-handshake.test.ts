import type { BrowserContext } from '@playwright/test';
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

/**
 * Clear cookies to trigger handshake flow.
 *
 * In DEVELOPMENT mode (pk_test_* keys), we need to clear:
 * - __client_uat, __client_uat_{suffix}
 * - __refresh_{suffix}
 *
 * In PRODUCTION mode, we would clear:
 * - __client_uat, __client_uat_{suffix}
 * - __session, __session_{suffix}
 * - __refresh_{suffix}
 *
 * Since integration tests run against dev instances, we use the dev mode approach.
 */
async function clearCookiesForHandshake(context: BrowserContext): Promise<void> {
  const cookies = await context.cookies();
  let suffix = null;

  ['__client_uat', '__refresh', '__session'].forEach(cookieName => {
    const cookie = cookies.find(cookie => cookie.name === cookieName);
    if (cookie) {
      suffix = cookie.name.match(new RegExp(`^${cookieName}_(.+)$`))?.[1] || null;
    }
  });

  await context.clearCookies({ name: '__client_uat' });

  if (suffix) {
    await context.clearCookies({ name: `__client_uat_${suffix}` });
    await context.clearCookies({ name: `__refresh_${suffix}` });
  }
}

testAgainstRunningApps({
  withEnv: [appConfigs.envs.withOutageMode],
})('Handshake Flow (Outage Mode) @outage-mode', ({ app }) => {
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

  test('handshake: should recover session via origin in normal mode', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });
    await u.po.expect.toBeSignedIn();

    const initialSessionId = await page.evaluate(() => {
      return (window as any).Clerk?.session?.id;
    });

    await clearCookiesForHandshake(context);
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();

    const sessionToken = await page.evaluate(() => {
      return (window as any).Clerk?.session?.lastActiveToken?.getRawString();
    });

    const sessionId = await page.evaluate(() => {
      return (window as any).Clerk?.session?.id;
    });

    await u.po.expect.toBeSignedIn();
    expect(sessionToken).toBeTruthy();
    expect(isEdgeGeneratedToken(sessionToken as string)).toBe(false);
    expect(sessionId).toBe(initialSessionId);
  });

  test('handshake: should recover session via proxy with opt-in header', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });
    await u.po.expect.toBeSignedIn();

    const initialSessionId = await page.evaluate(() => {
      return (window as any).Clerk?.session?.id;
    });

    await clearCookiesForHandshake(context);

    await page.route('**/*', async (route, request) => {
      const headers = {
        ...request.headers(),
        [ORIGIN_OUTAGE_MODE_OPT_IN_HEADER]: OPT_IN_HEADER_SECRET,
      };
      await route.continue({ headers });
    });

    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();

    await page.unroute('**/*');

    const sessionToken = await page.evaluate(() => {
      return (window as any).Clerk?.session?.lastActiveToken?.getRawString();
    });

    const sessionId = await page.evaluate(() => {
      return (window as any).Clerk?.session?.id;
    });

    await u.po.expect.toBeSignedIn();
    expect(sessionToken).toBeTruthy();
    expect(isEdgeGeneratedToken(sessionToken as string)).toBe(true);
    expect(sessionId).toBe(initialSessionId);
  });
});
