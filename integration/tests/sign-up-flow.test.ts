import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('sign up flow @generic @nextjs', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

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

    await fakeUser.deleteIfExists();
  });

  test("can't sign up with weak password", async ({ page, context }) => {
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
      password: '12345',
    });

    // Check if password error is visible
    await expect(u.page.getByTestId('form-feedback-error').first()).toBeVisible();
    await expect(u.page.getByTestId('form-feedback-error').first()).toHaveText(
      /your password must contain \d+ or more characters/i,
    );

    // Check if user is signed out
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

    // Go to sign up page
    await u.po.signUp.goTo();

    // Fill in sign up form
    await u.po.signUp.signUp({
      email: fakeUser.email,
      phoneNumber: fakeUser.phoneNumber,
      password: fakeUser.password,
    });

    // Verify email
    await u.po.signUp.enterTestOtpCode();
    // Verify phone number
    await u.po.signUp.enterTestOtpCode();

    // Check if user is signed in
    await u.po.expect.toBeSignedIn();
    await fakeUser.deleteIfExists();
  });

  test('(modal) can sign up with phone number', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });

    // Open modal
    await u.page.goToRelative('/buttons');
    await u.page.getByText('Sign up button (fallback)').click();
    await u.po.signUp.waitForModal();

    // Fill in sign up form
    await u.po.signUp.signUp({
      email: fakeUser.email,
      phoneNumber: fakeUser.phoneNumber,
      password: fakeUser.password,
    });

    // Verify email
    await u.po.signUp.enterTestOtpCode();
    // Verify phone number
    await u.po.signUp.enterTestOtpCode();

    // Check if user is signed in
    await u.po.expect.toBeSignedIn();
    await u.po.signUp.waitForModal('closed');
    await fakeUser.deleteIfExists();
  });

  test('sign up with first name, last name, email, phone and password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });

    // Go to sign up page
    await u.po.signUp.goTo();

    // Fill in sign up form
    await u.po.signUp.signUp({
      username: fakeUser.username,
      email: fakeUser.email,
      phoneNumber: fakeUser.phoneNumber,
      password: fakeUser.password,
    });

    // Verify email
    await u.po.signUp.enterTestOtpCode();
    // Verify phone number
    await u.po.signUp.enterTestOtpCode();

    // Check if user is signed in
    await u.po.expect.toBeSignedIn();

    // Toggle user button
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    // Expect user button popup to include user's username
    await expect(
      u.page.locator('.cl-userPreviewMainIdentifier__userButton').getByText(new RegExp(fakeUser.username, 'i')),
    ).toBeVisible();

    await fakeUser.deleteIfExists();
  });

  test('sign up, sign out and sign in again', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });

    // Go to sign up page
    await u.po.signUp.goTo();

    // Fill in sign up form
    await u.po.signUp.signUp({
      username: fakeUser.username,
      email: fakeUser.email,
      phoneNumber: fakeUser.phoneNumber,
      password: fakeUser.password,
    });

    // Verify email
    await u.po.signUp.enterTestOtpCode();
    // Verify phone number
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
