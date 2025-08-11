import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('sign in flow @generic @nextjs', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser({
      withPhoneNumber: true,
      withUsername: true,
    });
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('sign in with email and password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();
  });

  test('sign in with email and instant password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();
  });

  test('(modal) sign in with email and instant password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/buttons');
    await u.page.getByText('Sign in button (force)').click();
    await u.po.signIn.waitForModal();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();
    await u.po.signIn.waitForModal('closed');
  });

  test('sign in with email code', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.getIdentifierInput().fill(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.getUseAnotherMethodLink().click();
    await u.po.signIn.getAltMethodsEmailCodeButton().click();
    await u.po.signIn.enterTestOtpCode();
    await u.po.expect.toBeSignedIn();
  });

  test('sign in with phone number and password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.usePhoneNumberIdentifier().click();
    await u.po.signIn.getIdentifierInput().fill(fakeUser.phoneNumber);
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
    await u.po.signIn.goTo();
    await u.po.signIn.usePhoneNumberIdentifier().click();
    await u.po.signIn.getIdentifierInput().fill(fakeUserWithoutPassword.phoneNumber);
    await u.po.signIn.continue();
    await u.po.signIn.enterTestOtpCode();
    await u.po.expect.toBeSignedIn();

    await fakeUserWithoutPassword.deleteIfExists();
  });

  test('sign in with username and password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.getIdentifierInput().fill(fakeUser.username);
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

    await u.po.signIn.goTo();
    await u.po.signIn.getIdentifierInput().fill(fakeUserWithPasword.email);
    await u.po.signIn.continue();
    await u.po.signIn.getForgotPassword().click();
    await u.po.signIn.getResetPassword().click();
    await u.po.signIn.enterTestOtpCode();
    await u.po.signIn.setPassword(`${fakeUserWithPasword.password}_reset`);
    await u.po.signIn.setPasswordConfirmation(`${fakeUserWithPasword.password}_reset`);
    await u.po.signIn.getResetPassword().click();
    await u.po.expect.toBeSignedIn();

    await fakeUserWithPasword.deleteIfExists();
  });

  test('cannot sign in with wrong password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.getIdentifierInput().fill(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword('wrong-password');
    await u.po.signIn.continue();
    await expect(u.page.getByText(/password is incorrect/i)).toBeVisible();

    await u.po.expect.toBeSignedOut();
  });

  test('cannot sign in with wrong password but can sign in with email', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.getIdentifierInput().fill(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword('wrong-password');
    await u.po.signIn.continue();

    await expect(u.page.getByText(/password is incorrect/i)).toBeVisible();

    await u.po.signIn.getUseAnotherMethodLink().click();
    await u.po.signIn.getAltMethodsEmailCodeButton().click();
    await u.po.signIn.enterTestOtpCode();

    await u.po.expect.toBeSignedIn();
  });
});
