import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('sign up flow @generic @nextjs', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('sign up with email and password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });
    await u.po.signUp.goTo();
    await u.po.signUp.signUpWithEmailAndPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });
    await u.po.signUp.enterTestOtpCode();
    await u.po.expect.toBeSignedIn();
    await fakeUser.deleteIfExists();
  });

  test("can't sign up with weak password", async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });
    await u.po.signUp.goTo();
    await u.po.signUp.signUpWithEmailAndPassword({
      email: fakeUser.email,
      password: '123456789',
    });

    await expect(u.page.locator('[id=error-password]')).toBeVisible();

    await u.po.expect.toBeSignedOut();

    await fakeUser.deleteIfExists();
  });

  test('can sign up with phone number', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });
    await u.po.signUp.goTo();
    await u.po.signUp.signUp({
      email: fakeUser.email,
      phoneNumber: fakeUser.phoneNumber,
      password: fakeUser.password,
    });
    // Verify email
    await u.po.signUp.enterTestOtpCode();
    // Verify phone number
    await u.po.signUp.enterTestOtpCode();
    await u.po.expect.toBeSignedIn();
    await fakeUser.deleteIfExists();
  });
});
