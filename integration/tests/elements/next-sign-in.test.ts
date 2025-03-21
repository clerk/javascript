import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('Next.js Sign-In Flow @elements', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

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

  test('sign in with email and password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo({ headlessSelector: '[data-test-id="sign-in-step-start"]' });

    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.page.waitForAppUrl('/sign-in/continue');
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();

    await u.po.expect.toBeSignedIn();
  });

  test('sign in with email and instant password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo({ headlessSelector: '[data-test-id="sign-in-step-start"]' });

    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

    await u.po.expect.toBeSignedIn();
  });

  test('does not allow arbitrary redirect URLs on sign in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo({
      searchParams: new URLSearchParams({ redirect_url: 'https://evil.com' }),
      headlessSelector: '[data-test-id="sign-in-step-start"]',
    });

    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

    expect(u.page.url()).not.toContain('https://evil.com');

    await u.po.expect.toBeSignedIn();
  });

  test('sign in with email code', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo({ headlessSelector: '[data-test-id="sign-in-step-start"]' });

    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();

    await u.page.getByRole('button', { name: /use another method/i }).click();
    await u.po.signIn.getAltMethodsEmailCodeButton().click();
    await u.po.signIn.fillTestOtpCode('Enter email verification code');
    await page.waitForTimeout(2000);
    // TODO: In original test the input has autoSubmit and this step is not needed. Not used right now because it didn't work.
    await u.po.signIn.continue();

    await u.page.waitForAppUrl('/');
    await u.po.expect.toBeSignedIn();
  });

  test('sign in with phone number and password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo({ headlessSelector: '[data-test-id="sign-in-step-start"]' });

    await u.page.getByRole('button', { name: /^use phone/i }).click();
    await u.po.signIn.getIdentifierInput().fill(fakeUser.phoneNumber);
    await u.po.signIn.continue();
    await u.page.waitForAppUrl('/sign-in/continue');
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();

    await u.po.expect.toBeSignedIn();
  });

  test('sign in only with phone number', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUserWithoutPassword = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPassword: false,
      withPhoneNumber: true,
    });
    await u.services.users.createBapiUser(fakeUserWithoutPassword);
    await u.po.signIn.goTo({ headlessSelector: '[data-test-id="sign-in-step-start"]' });
    await u.page.getByRole('button', { name: /^use phone/i }).click();
    await u.po.signIn.getIdentifierInput().fill(fakeUserWithoutPassword.phoneNumber);
    await u.po.signIn.continue();
    await u.po.signIn.fillTestOtpCode('Enter phone verification code');
    await page.waitForTimeout(2000);
    await u.po.signIn.continue();

    await u.po.expect.toBeSignedIn();

    await fakeUserWithoutPassword.deleteIfExists();
  });

  test('sign in with username and password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo({ headlessSelector: '[data-test-id="sign-in-step-start"]' });

    await u.po.signIn.getIdentifierInput().fill(fakeUser.username);
    await u.po.signIn.continue();
    await u.page.waitForAppUrl('/sign-in/continue');
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();

    await u.po.expect.toBeSignedIn();
  });

  test('can reset password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUserWithPasword = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPassword: true,
    });
    await u.services.users.createBapiUser(fakeUserWithPasword);

    await u.po.signIn.goTo({ headlessSelector: '[data-test-id="sign-in-step-start"]' });

    await u.po.signIn.getIdentifierInput().fill(fakeUserWithPasword.email);
    await u.po.signIn.continue();
    await u.page.getByRole('button', { name: /^forgot password/i }).click();
    await u.po.signIn.getResetPassword().click();
    await u.po.signIn.fillTestOtpCode('Enter email verification code');
    await page.waitForTimeout(2000);
    // TODO: In original test the input has autoSubmit and this step is not needed. Not used right now because it didn't work.
    await u.po.signIn.continue();

    await u.po.signIn.setPassword(`${fakeUserWithPasword.password}_reset`);
    await u.po.signIn.setPasswordConfirmation(`${fakeUserWithPasword.password}_reset`);
    await u.po.signIn.getResetPassword().click();
    await u.po.expect.toBeSignedIn();

    await fakeUserWithPasword.deleteIfExists();
  });

  test('cannot sign in with wrong password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo({ headlessSelector: '[data-test-id="sign-in-step-start"]' });
    await u.po.signIn.getIdentifierInput().fill(fakeUser.email);
    await u.po.signIn.continue();
    await u.page.waitForAppUrl('/sign-in/continue');
    await u.po.signIn.setPassword('wrong-password');
    await u.po.signIn.continue();
    await expect(u.page.getByText(/^password is incorrect/i)).toBeVisible();

    await u.po.expect.toBeSignedOut();
  });

  test('cannot sign in with wrong password but can sign in with email', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo({ headlessSelector: '[data-test-id="sign-in-step-start"]' });
    await u.po.signIn.getIdentifierInput().fill(fakeUser.email);
    await u.po.signIn.continue();
    await u.page.waitForAppUrl('/sign-in/continue');
    await u.po.signIn.setPassword('wrong-password');
    await u.po.signIn.continue();

    await expect(u.page.getByText(/^password is incorrect/i)).toBeVisible();

    await u.page.getByRole('button', { name: /use another method/i }).click();
    await u.po.signIn.getAltMethodsEmailCodeButton().click();
    await u.po.signIn.fillTestOtpCode('Enter email verification code');
    await page.waitForTimeout(2000);
    // TODO: In original test the input has autoSubmit and this step is not needed. Not used right now because it didn't work.
    await u.po.signIn.continue();

    await u.po.expect.toBeSignedIn();
  });
});
