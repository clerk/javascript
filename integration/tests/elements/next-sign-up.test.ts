import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('Next.js Sign-Up Flow @elements', ({ app }) => {
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

    await u.po.signUp.goTo({ headlessSelector: '[data-test-id="sign-up-step-start"]' });

    await u.po.signUp.signUpWithEmailAndPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });

    await u.po.signUp.fillTestOtpCode('Enter email verification code');
    await page.waitForTimeout(2000);
    // TODO: In original test the input has autoSubmit and this step is not needed. Not used right now because it didn't work.
    await u.po.signUp.continue();

    await u.page.waitForAppUrl('/');
    await u.po.expect.toBeSignedIn();

    await fakeUser.deleteIfExists();
  });

  test('does not allow arbitrary redirect URLs on sign up', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });

    await u.po.signUp.goTo({
      searchParams: new URLSearchParams({ redirect_url: 'https://evil.com' }),
      headlessSelector: '[data-test-id="sign-up-step-start"]',
    });

    await u.po.signUp.signUpWithEmailAndPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });

    await u.po.signUp.fillTestOtpCode('Enter email verification code');
    await page.waitForTimeout(2000);
    // TODO: In original test the input has autoSubmit and this step is not needed. Not used right now because it didn't work.
    await u.po.signUp.continue();

    await u.page.waitForAppUrl('/');
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

    await u.po.signUp.goTo({ headlessSelector: '[data-test-id="sign-up-step-start"]' });

    await u.po.signUp.signUpWithEmailAndPassword({
      email: fakeUser.email,
      password: '12345',
    });

    // Check if password error is visible
    await expect(u.page.getByText(/Passwords must be \d+ characters or more/i)).toBeVisible();

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

    await u.po.signUp.goTo({ headlessSelector: '[data-test-id="sign-up-step-start"]' });

    await u.po.signUp.signUp({
      email: fakeUser.email,
      phoneNumber: fakeUser.phoneNumber,
      password: fakeUser.password,
    });

    await u.po.signUp.fillTestOtpCode('Enter phone verification code');
    await page.waitForTimeout(2000);
    // TODO: In original test the input has autoSubmit and this step is not needed. Not used right now because it didn't work.
    await u.po.signUp.continue();
    await page.waitForTimeout(2000);
    await u.po.signUp.fillTestOtpCode('Enter email verification code');
    await page.waitForTimeout(2000);
    // TODO: In original test the input has autoSubmit and this step is not needed. Not used right now because it didn't work.
    await u.po.signUp.continue();

    await u.po.expect.toBeSignedIn();
    await fakeUser.deleteIfExists();
  });

  test('sign up with first name, last name, email, phone and password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });

    await u.po.signUp.goTo({ headlessSelector: '[data-test-id="sign-up-step-start"]' });

    await u.po.signUp.signUp({
      username: fakeUser.username,
      email: fakeUser.email,
      phoneNumber: fakeUser.phoneNumber,
      password: fakeUser.password,
    });

    await u.po.signUp.fillTestOtpCode('Enter phone verification code');
    await page.waitForTimeout(2000);
    // TODO: In original test the input has autoSubmit and this step is not needed. Not used right now because it didn't work.
    await u.po.signUp.continue();
    await u.po.signUp.fillTestOtpCode('Enter email verification code');
    await page.waitForTimeout(2000);
    // TODO: In original test the input has autoSubmit and this step is not needed. Not used right now because it didn't work.
    await u.po.signUp.continue();

    await u.po.expect.toBeSignedIn();

    await fakeUser.deleteIfExists();
  });

  test('sign up, sign out and sign in again', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });

    await u.po.signUp.goTo({ headlessSelector: '[data-test-id="sign-up-step-start"]' });

    await u.po.signUp.signUp({
      username: fakeUser.username,
      email: fakeUser.email,
      phoneNumber: fakeUser.phoneNumber,
      password: fakeUser.password,
    });

    await u.po.signUp.fillTestOtpCode('Enter phone verification code');
    await page.waitForTimeout(2000);
    // TODO: In original test the input has autoSubmit and this step is not needed. Not used right now because it didn't work.
    await u.po.signUp.continue();
    await u.po.signUp.fillTestOtpCode('Enter email verification code');
    await page.waitForTimeout(2000);
    // TODO: In original test the input has autoSubmit and this step is not needed. Not used right now because it didn't work.
    await u.po.signUp.continue();

    await u.po.expect.toBeSignedIn();

    await u.page.evaluate(async () => {
      await window.Clerk.signOut();
    });

    await u.po.expect.toBeSignedOut();

    await u.po.signIn.goTo({ headlessSelector: '[data-test-id="sign-in-step-start"]' });

    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.page.waitForAppUrl('/sign-in/continue');
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();

    await u.po.expect.toBeSignedIn();

    await fakeUser.deleteIfExists();
  });
});
