import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withCombinedFlow] })('combined sign up flow @nextjs', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('sign up with email and password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPassword: true,
    });

    // Go to sign in page
    await u.po.signIn.goTo();

    // Fill in sign in form
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.page.waitForAppUrl('/sign-in/create');

    const prefilledEmail = await u.po.signUp.getEmailAddressInput().inputValue();
    expect(prefilledEmail).toBe(fakeUser.email);

    await u.po.signUp.setPassword(fakeUser.password);
    await u.po.signUp.continue();

    // Verify email
    await u.po.signUp.enterTestOtpCode();

    // Check if user is signed in
    await u.po.expect.toBeSignedIn();

    await fakeUser.deleteIfExists();
  });

  test('sign up with username, email, and password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPassword: true,
      withUsername: true,
    });

    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(fakeUser.username);
    await u.po.signIn.continue();
    await u.page.waitForAppUrl('/sign-in/create');

    const prefilledUsername = await u.po.signUp.getUsernameInput().inputValue();
    expect(prefilledUsername).toBe(fakeUser.username);

    await u.po.signUp.setEmailAddress(fakeUser.email);
    await u.po.signUp.setPassword(fakeUser.password);
    await u.po.signUp.continue();

    await u.po.signUp.enterTestOtpCode();

    await u.po.expect.toBeSignedIn();

    await fakeUser.deleteIfExists();
  });

  test('sign up, sign out and sign in again', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPassword: true,
      withUsername: true,
    });

    // Go to sign in page
    await u.po.signIn.goTo();

    // Fill in sign in form
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.page.waitForAppUrl('/sign-in/create');

    const prefilledEmail = await u.po.signUp.getEmailAddressInput().inputValue();
    expect(prefilledEmail).toBe(fakeUser.email);

    await u.po.signUp.setPassword(fakeUser.password);
    await u.po.signUp.continue();

    // Verify email
    await u.po.signUp.enterTestOtpCode();

    // Check if user is signed in
    await u.po.expect.toBeSignedIn();

    // Toggle user button
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    // Click sign out
    await u.po.userButton.triggerSignOut();

    // Check if user is signed out
    await u.po.expect.toBeSignedOut();

    // Go to sign in page
    await u.po.signIn.goTo();

    // Fill in sign in form
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });

    // Check if user is signed in
    await u.po.expect.toBeSignedIn();

    await fakeUser.deleteIfExists();
  });
});
