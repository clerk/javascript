import { test } from '@playwright/test';

import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withPattern: ['react.vite.withEmailCodes'] })('sign in flow @generic', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

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
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('updating props after initial loading does not override defaults set by Clerk.load()', async ({
    page,
    context,
  }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo({ searchParams: new URLSearchParams({ redirect_url: 'https://www.clerk.com' }) });
    await u.page.waitForFunction(async () => {
      // Emulate ClerkProvider being unmounted and mounted again
      // as updateProps is going to be called without the default options set by window.Clerk.load()
      await (window.Clerk as any).__internal__updateProps({ options: {} });
    });
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();
    // allowedRedirectOrigins should still be respected here
    // even after the above updateProps invocation
    await u.page.waitForURL(`${app.serverUrl}`);
  });
});
