import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withCustomRoles] })('navigation modes @nuxt', ({ app }) => {
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

  test('sign in with path routing', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();

    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.page.waitForURL(`${app.serverUrl}/sign-in/factor-one`);

    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();

    await u.po.expect.toBeSignedIn();
  });

  test('sign in with hash routing', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToRelative('/hash/sign-in');
    await u.po.signIn.waitForMounted();

    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.page.waitForURL(`${app.serverUrl}/hash/sign-in#/factor-one`);

    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();
  });

  test('sign in with path routing navigates to previous page', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();

    await u.po.signIn.getGoToSignUp().click();
    await u.po.signUp.waitForMounted();
    await u.page.waitForURL(`${app.serverUrl}/sign-up`);

    await page.goBack();
    await u.po.signIn.waitForMounted();
    await u.page.waitForURL(`${app.serverUrl}/sign-in`);
  });

  test('user profile uses path routing', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/user-profile/security');
    await expect(u.page.locator('.cl-headerTitle').filter({ hasText: 'Security' })).toBeVisible();
  });
});
