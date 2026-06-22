import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodesQuickstart] })('nextjs @quickstart', ({ app }) => {
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

  test('Clerk client loads on first visit and Sign In button renders', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();

    await u.page.waitForClerkJsLoaded();

    await u.po.expect.toBeSignedOut();

    await expect(u.page.getByRole('button', { name: /Sign in/i })).toBeVisible();
  });

  test('can sign in with email and password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();

    await u.page.getByRole('button', { name: /Sign in/i }).click();

    await u.po.signIn.waitForMounted();

    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

    await u.page.waitForAppUrl('/');

    await u.po.expect.toBeSignedIn();
    await u.po.userButton.waitForMounted();

    await expect(u.page.getByRole('button', { name: /Open user menu/i })).toBeVisible();
  });

  test('user button is functional after sign in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();

    await u.page.getByRole('button', { name: /Sign in/i }).click();

    await u.po.signIn.waitForMounted();

    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

    await u.page.waitForAppUrl('/');

    await u.po.expect.toBeSignedIn();

    await u.po.userButton.waitForMounted();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    await u.po.userButton.toHaveVisibleMenuItems([/Manage account/i, /Sign out$/i]);

    await u.po.userButton.triggerManageAccount();
    await u.po.userProfile.waitForUserProfileModal();

    await expect(u.page.getByText(/profile details/i)).toBeVisible();
  });

  test('can sign out through user button', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();

    await u.page.getByRole('button', { name: /Sign in/i }).click();

    await u.po.signIn.waitForMounted();

    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

    await u.page.waitForAppUrl('/');

    await u.po.expect.toBeSignedIn();

    await u.po.userButton.waitForMounted();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    await u.po.userButton.toHaveVisibleMenuItems([/Sign out$/i]);

    await u.po.userButton.triggerSignOut();

    await u.page.waitForAppUrl('/');

    await u.po.expect.toBeSignedOut();
    await expect(u.page.getByRole('button', { name: /Sign in/i })).toBeVisible();
  });
});
