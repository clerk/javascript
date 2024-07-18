import { test } from '@playwright/test';

import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withPattern: ['astro.node.withCustomRoles'] })('redirectToSignIn for @astro', ({ app }) => {
  test.describe.configure({ mode: 'serial' });
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    const m = createTestUtils({ app });
    fakeUser = m.services.users.createFakeUser();
    await m.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('redirects to sign-in when unauthenticated (middleware)', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.getByRole('link', { name: 'User', exact: true }).click();
    await u.page.waitForURL(`${app.serverUrl}/sign-in?redirect_url=${encodeURIComponent(`${app.serverUrl}/user`)}`);
  });

  test('redirects to sign-in when unauthenticated (page)', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.getByRole('link', { name: 'Organization', exact: true }).click();
    await u.page.waitForURL(
      `${app.serverUrl}/sign-in?redirect_url=${encodeURIComponent(`${app.serverUrl}/organization`)}`,
    );
  });
});
