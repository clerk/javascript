import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { createTestUtils, type FakeUser, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSignInOrUpFlow] })('sign-in-or-up flow @nextjs', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  test.afterAll(async () => {
    await app.teardown();
  });

  test.describe('sign-in', () => {
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
    });

    test('flows are combined', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();

      await expect(u.page.getByText(`Don’t have an account?`)).toBeHidden();
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

    test('(modal) sign in with email code', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/buttons');
      await u.page.getByText('Sign in button (fallback)').click();
      await u.po.signIn.waitForModal();
      await u.po.signIn.getIdentifierInput().fill(fakeUser.email);
      await u.po.signIn.continue();
      await u.po.signIn.getUseAnotherMethodLink().click();
      await u.po.signIn.getAltMethodsEmailCodeButton().click();
      await u.po.signIn.enterTestOtpCode();
      await u.po.expect.toBeSignedIn();
      await u.po.signIn.waitForModal('closed');
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
      await expect(u.page.getByTestId('form-feedback-error')).toBeVisible();
      await expect(u.page.getByTestId('form-feedback-error')).toHaveText(/password is incorrect/i);

      await u.po.expect.toBeSignedOut();
    });

    test('cannot sign in with wrong password but can sign in with email', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.po.signIn.goTo();
      await u.po.signIn.getIdentifierInput().fill(fakeUser.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword('wrong-password');
      await u.po.signIn.continue();

      await expect(u.page.getByTestId('form-feedback-error')).toBeVisible();
      await expect(u.page.getByTestId('form-feedback-error')).toHaveText(/password is incorrect/i);

      await u.po.signIn.getUseAnotherMethodLink().click();
      await u.po.signIn.getAltMethodsEmailCodeButton().click();
      await u.po.signIn.enterTestOtpCode();

      await u.po.expect.toBeSignedIn();
    });

    test('access protected page', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();

      expect(await u.page.locator("data-test-id='protected-api-response'").count()).toEqual(0);
      await u.page.goToRelative('/protected');
      await u.page.isVisible("data-test-id='protected-api-response'");
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

      const prefilledEmail = u.po.signUp.getEmailAddressInput();
      await expect(prefilledEmail).toHaveValue(fakeUser.email);

      await u.po.signUp.setPassword(fakeUser.password);
      await u.po.signUp.continue();

      // Verify email
      await u.po.signUp.enterTestOtpCode();

      // Check if user is signed in
      await u.po.expect.toBeSignedIn();

      await fakeUser.deleteIfExists();
    });
  });

  test.describe('sign-up', () => {
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

      const prefilledUsername = u.po.signUp.getUsernameInput();
      await expect(prefilledUsername).toHaveValue(fakeUser.username);

      await u.po.signUp.setEmailAddress(fakeUser.email);
      await u.po.signUp.setPassword(fakeUser.password);
      await u.po.signUp.continue();

      await u.po.signUp.enterTestOtpCode();

      await u.po.expect.toBeSignedIn();

      await fakeUser.deleteIfExists();
    });

    test('(modal) sign up with username, email, and password', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const fakeUser = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPassword: true,
        withUsername: true,
      });

      await u.page.goToRelative('/buttons');
      await u.page.getByText('Sign in button (fallback)').click();
      await u.po.signIn.waitForModal();
      await u.po.signIn.setIdentifier(fakeUser.username);
      await u.po.signIn.continue();

      const prefilledUsername = u.po.signUp.getUsernameInput();
      await expect(prefilledUsername).toHaveValue(fakeUser.username);

      await u.po.signUp.setEmailAddress(fakeUser.email);
      await u.po.signUp.setPassword(fakeUser.password);
      await u.po.signUp.continue();

      await u.po.signUp.enterTestOtpCode();

      await u.po.expect.toBeSignedIn();
      await u.po.signIn.waitForModal('closed');

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

      const prefilledEmail = u.po.signUp.getEmailAddressInput();
      await expect(prefilledEmail).toHaveValue(fakeUser.email);

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

    test('sign in with ticket renders sign up', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo({
        searchParams: new URLSearchParams({ __clerk_ticket: '123', __clerk_status: 'sign_up' }),
      });
      await u.page.waitForAppUrl('/sign-in/create?__clerk_ticket=123');
      await expect(u.page.getByText(/Create your account/i)).toBeVisible();
    });
  });
});
