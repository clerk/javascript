import { test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('custom flows test suite @expoWeb', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });
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

  test('sign in using custom flow', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/custom-sign-in');

    await u.page.getByTestId('emailAddress-input').fill(fakeUser.email);
    await u.page.getByTestId('password-input').fill(fakeUser.password);

    await u.page.getByRole('button', { name: /sign in/i }).click();

    await u.page.waitForAppUrl('/');

    await u.po.expect.toBeSignedIn();

    await u.po.userButton.waitForMounted();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    await u.po.userButton.toHaveVisibleMenuItems([/Manage account/i, /Sign out$/i]);
  });

  test('sign up using custom flow and also delete user', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeSignUpUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });

    await u.page.goToRelative('/custom-sign-up');

    await u.page.getByTestId('emailAddress-input').fill(fakeSignUpUser.email);
    await u.page.getByTestId('password-input').fill(fakeSignUpUser.password);
    await u.page.getByRole('button', { name: /sign up/i }).click();

    await u.page.getByTestId('code-input').fill('424242');
    await u.page.getByRole('button', { name: /verify email/i }).click();

    await u.page.waitForAppUrl('/');

    await u.po.expect.toBeSignedIn();

    await u.po.userButton.waitForMounted();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    await u.po.userButton.triggerManageAccount();

    await u.po.userProfile.waitForUserProfileModal();

    await u.po.userProfile.switchToSecurityTab();

    await u.page
      .getByRole('button', {
        name: /delete account/i,
      })
      .click();

    await u.page.locator('input[name=deleteConfirmation]').fill('Delete account');

    await u.page
      .getByRole('button', {
        name: /delete account/i,
      })
      .click();

    await u.page.waitForAppUrl('/');

    await u.po.expect.toBeSignedOut();
  });
});
