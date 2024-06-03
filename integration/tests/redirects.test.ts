import { test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('redirect props @nextjs', ({ app }) => {
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

  test.describe('SignInButton', () => {
    test('sign in button respects forceRedirectUrl', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.page.goToRelative('/buttons');
      await u.page.waitForClerkJsLoaded();
      await u.po.expect.toBeSignedOut();

      await u.page.getByText('Sign in button (force)').click();

      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

      await u.page.waitForAppUrl('/protected');

      await u.po.expect.toBeSignedIn();
    });

    test('sign in button respects fallbackRedirectUrl', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.page.goToRelative('/buttons');
      await u.page.waitForClerkJsLoaded();
      await u.po.expect.toBeSignedOut();

      await u.page.getByText('Sign in button (fallback)').click();

      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

      await u.page.waitForAppUrl('/protected');

      await u.po.expect.toBeSignedIn();
    });
  });

  test.describe('SignUpButton', () => {
    test('sign up button respects forceRedirectUrl', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const fakeUser = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPhoneNumber: true,
        withUsername: true,
      });

      await u.page.goToRelative('/buttons');
      await u.page.waitForClerkJsLoaded();

      await u.page.getByText('Sign up button (force)').click();

      // Fill in sign up form
      await u.po.signUp.signUpWithEmailAndPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });

      // Verify email
      await u.po.signUp.enterTestOtpCode();

      await u.page.waitForAppUrl('/protected');

      // Check if user is signed in
      await u.po.expect.toBeSignedIn();

      await fakeUser.deleteIfExists();
    });

    test('sign up button respects fallbackRedirectUrl', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const fakeUser = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPhoneNumber: true,
        withUsername: true,
      });

      await u.page.goToRelative('/buttons');
      await u.page.waitForClerkJsLoaded();

      await u.page.getByText('Sign up button (fallback)').click();

      // Fill in sign up form
      await u.po.signUp.signUpWithEmailAndPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });

      // Verify email
      await u.po.signUp.enterTestOtpCode();

      await u.page.waitForAppUrl('/protected');

      // Check if user is signed in
      await u.po.expect.toBeSignedIn();

      await fakeUser.deleteIfExists();
    });
  });
});
