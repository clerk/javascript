import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withLegalConsent] })(
  'sign up flow with legal consent @generic @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    test.afterAll(async () => {
      await app.teardown();
    });

    test('sign up with email and password and legal consent', async ({ page, context }) => {
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
        password: fakeUser.password,
        legalAccepted: true,
      });

      // Verify email
      await u.po.signUp.enterTestOtpCode();

      // Check if user is signed in
      await u.po.expect.toBeSignedIn();

      await fakeUser.deleteIfExists();
    });

    test('cant sign up when legal consent checkbox is not checked', async ({ page, context }) => {
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
        password: fakeUser.password,
      });

      // We don't need to fill in the OTP code, because the user is not signed up
      await expect(page.getByLabel('Enter verification code')).toBeHidden();

      // Check if user is signed out
      await u.po.expect.toBeSignedOut();

      await fakeUser.deleteIfExists();
    });
  },
);
