import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

// SafeLocalStorage prepends '__clerk_' to all keys
const SWR_CACHE_KEY_PREFIX = '__clerk_swr_client_';

async function hasSWRCache(page: Page): Promise<boolean> {
  return page.evaluate((prefix: string) => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        return true;
      }
    }
    return false;
  }, SWR_CACHE_KEY_PREFIX);
}

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes_swr] })('swr initialization @generic', ({ app }) => {
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

  test('signed-in user loads from cache on second visit (page reload)', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // First visit: sign in normally
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    expect(await hasSWRCache(page)).toBe(true);

    // Second visit: should load from cache
    await page.reload();
    await u.po.clerk.toBeLoaded();
    await u.po.expect.toBeSignedIn();
  });

  test('cache is cleared on sign-out', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    expect(await hasSWRCache(page)).toBe(true);

    await page.evaluate(async () => {
      await window.Clerk.signOut();
    });
    await u.po.expect.toBeSignedOut();

    expect(await hasSWRCache(page)).toBe(false);
  });

  test('revoked session falls back to normal flow', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    const sessionId = await page.evaluate(() => window.Clerk?.session?.id);
    expect(sessionId).toBeTruthy();
    expect(await hasSWRCache(page)).toBe(true);

    // Revoke session server-side, then reload
    await u.services.clerk.sessions.revokeSession(sessionId!);
    await page.reload();
    await u.po.clerk.toBeLoaded();

    await u.po.expect.toBeSignedOut();
  });
});
