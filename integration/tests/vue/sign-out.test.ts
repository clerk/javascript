import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withCustomRoles] })('sign-out tests for @vue', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

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

  test.afterEach(async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.signOut();
    await u.page.context().clearCookies();
  });

  test('<SignOutButton /> signs the user out when clicked', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/sign-out');
    await expect(u.page.locator('[data-signed-in]')).toBeVisible();

    await u.page.getByRole('button', { name: /Sign out/i }).click();
    await expect(u.page.locator('[data-signed-out]')).toBeVisible();
    await u.po.expect.toBeSignedOut();
  });
});
