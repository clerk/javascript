import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('unsafeMetadata @nextjs', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('sign up persists unsafeMetadata', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });

    // Go to sign up page
    await u.po.signUp.goTo();

    // Fill in sign up form
    await u.po.signUp.signUpWithEmailAndPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });

    // Verify email
    await u.po.signUp.enterTestOtpCode();

    // Check if user is signed in
    await u.po.expect.toBeSignedIn();

    const user = await u.services.users.getUser({ email: fakeUser.email });
    expect(user?.unsafeMetadata).toEqual({ position: 'goalie' });

    await fakeUser.deleteIfExists();
  });

  test('combined sign up persists unsafeMetadata', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPassword: true,
      withUsername: true,
    });

    await u.page.goToRelative('/sign-in-or-up');
    await u.po.signIn.setIdentifier(fakeUser.username);
    await u.po.signIn.continue();
    await u.page.waitForAppUrl('/sign-in-or-up/create');

    const prefilledUsername = u.po.signUp.getUsernameInput();
    await expect(prefilledUsername).toHaveValue(fakeUser.username);

    await u.po.signUp.setEmailAddress(fakeUser.email);
    await u.po.signUp.setPassword(fakeUser.password);
    await u.po.signUp.continue();

    await u.po.signUp.enterTestOtpCode();

    await u.po.expect.toBeSignedIn();

    const user = await u.services.users.getUser({ email: fakeUser.email });
    expect(user?.unsafeMetadata).toEqual({ position: 'goalie' });

    await fakeUser.deleteIfExists();
  });
});
