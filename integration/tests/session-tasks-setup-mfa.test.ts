import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';
import { stringPhoneNumber } from '../testUtils/phoneUtils';
import { fakerPhoneNumber } from '../testUtils/usersService';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSessionTasksSetupMfa] })(
  'session tasks setup-mfa flow @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'parallel' });

    test.afterAll(async () => {
      await app.teardown();
    });

    test.afterEach(async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.signOut();
      await u.page.context().clearCookies();
    });

    test('setup MFA with new phone number - happy path', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const user = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPassword: true,
      });
      await u.services.users.createBapiUser(user);

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: user.email, password: user.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/page-protected');

      await u.page.getByText(/set up two-step verification/i).waitFor({ state: 'visible' });

      await u.page.getByRole('button', { name: /sms code/i }).click();

      const testPhoneNumber = fakerPhoneNumber();
      await u.po.signIn.getPhoneNumberInput().fill(testPhoneNumber);
      await u.page.getByRole('button', { name: /continue/i }).click();

      await u.po.signIn.enterTestOtpCode();

      await u.page.getByText(/save these backup codes/i).waitFor({ state: 'visible', timeout: 10000 });

      await u.po.signIn.continue();

      await u.page.waitForAppUrl('/page-protected');
      await u.po.expect.toBeSignedIn();

      await user.deleteIfExists();
    });

    test('setup MFA with existing phone number - happy path', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const user = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPhoneNumber: true,
        withPassword: true,
      });
      await u.services.users.createBapiUser(user);

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: user.email, password: user.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/page-protected');

      await u.page.getByText(/set up two-step verification/i).waitFor({ state: 'visible' });

      await u.page.getByRole('button', { name: /sms code/i }).click();

      const formattedPhoneNumber = stringPhoneNumber(user.phoneNumber);
      await u.page
        .getByRole('button', {
          name: formattedPhoneNumber,
        })
        .click();

      await u.page.getByText(/save these backup codes/i).waitFor({ state: 'visible', timeout: 10000 });

      await u.po.signIn.continue();

      await u.page.waitForAppUrl('/page-protected');
      await u.po.expect.toBeSignedIn();

      await user.deleteIfExists();
    });

    test('setup MFA with invalid phone number - error handling', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const user = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPassword: true,
      });
      await u.services.users.createBapiUser(user);

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: user.email, password: user.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/page-protected');

      await u.page.getByText(/set up two-step verification/i).waitFor({ state: 'visible' });

      await u.page.getByRole('button', { name: /sms code/i }).click();

      const invalidPhoneNumber = '123091293193091311';
      await u.po.signIn.getPhoneNumberInput().fill(invalidPhoneNumber);
      await u.po.signIn.continue();
      // we need to improve this error message
      await expect(u.page.getByTestId('form-feedback-error')).toBeVisible();

      const validPhoneNumber = fakerPhoneNumber();
      await u.po.signIn.getPhoneNumberInput().fill(validPhoneNumber);
      await u.po.signIn.continue();

      await u.po.signIn.enterTestOtpCode();

      await u.page.getByText(/save these backup codes/i).waitFor({ state: 'visible', timeout: 10000 });

      await u.po.signIn.continue();

      await u.page.waitForAppUrl('/page-protected');
      await u.po.expect.toBeSignedIn();

      await user.deleteIfExists();
    });

    test('setup MFA with invalid verification code - error handling', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const user = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPassword: true,
      });
      await u.services.users.createBapiUser(user);

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: user.email, password: user.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/page-protected');

      await u.page.getByText(/set up two-step verification/i).waitFor({ state: 'visible' });

      await u.page.getByRole('button', { name: /sms code/i }).click();

      const testPhoneNumber = fakerPhoneNumber();
      await u.po.signIn.getPhoneNumberInput().fill(testPhoneNumber);
      await u.po.signIn.continue();

      await u.po.signIn.enterOtpCode('111111', {
        awaitPrepare: true,
        awaitAttempt: true,
      });

      await expect(u.page.getByTestId('form-feedback-error')).toBeVisible();

      await user.deleteIfExists();
    });

    test('can navigate back during MFA setup', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const user = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPhoneNumber: true,
        withPassword: true,
      });
      await u.services.users.createBapiUser(user);

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: user.email, password: user.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/page-protected');

      await u.page.getByText(/set up two-step verification/i).waitFor({ state: 'visible' });

      await u.page.getByRole('button', { name: /sms code/i }).click();

      const formattedPhoneNumber = stringPhoneNumber(user.phoneNumber);
      await u.page
        .getByRole('button', {
          name: formattedPhoneNumber,
        })
        .waitFor({ state: 'visible' });

      await u.page
        .getByRole('button', { name: /cancel/i })
        .first()
        .click();

      await u.page.getByText(/set up two-step verification/i).waitFor({ state: 'visible' });
      await u.page.getByRole('button', { name: /sms code/i }).waitFor({ state: 'visible' });

      await user.deleteIfExists();
    });

    test('can sign in as a different account from the two-step verification step', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const user = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPhoneNumber: true,
        withPassword: true,
      });
      await u.services.users.createBapiUser(user);

      try {
        // Enroll SMS as a second factor using the user's existing phone number.
        await u.po.signIn.goTo();
        await u.po.signIn.waitForMounted();
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: user.email, password: user.password });
        await u.po.expect.toBeSignedIn();

        await u.page.goToRelative('/page-protected');
        await u.page.getByText(/set up two-step verification/i).waitFor({ state: 'visible' });
        await u.page.getByRole('button', { name: /sms code/i }).click();
        const formattedPhoneNumber = stringPhoneNumber(user.phoneNumber);
        await u.page.getByRole('button', { name: formattedPhoneNumber }).click();
        await u.page.getByText(/save these backup codes/i).waitFor({ state: 'visible', timeout: 10000 });
        await u.po.signIn.continue();
        await u.page.waitForAppUrl('/page-protected');
        await u.po.expect.toBeSignedIn();

        // Sign out and back in so the sign-in flow now requires the second factor.
        await u.page.signOut();
        await u.page.context().clearCookies();

        await u.po.signIn.goTo();
        await u.po.signIn.waitForMounted();
        await u.po.signIn.getIdentifierInput().fill(user.email);
        await u.po.signIn.setInstantPassword(user.password);
        await u.po.signIn.continue();

        // We are now on the two-step verification (SMS second factor) step, with no way to
        // complete it if this is the wrong account.
        await u.page.getByText(/check your phone/i).waitFor({ state: 'visible' });

        // The "Back" action abandons the attempt and returns to the start.
        const differentAccount = u.page.getByRole('link', { name: /^back$/i });
        await expect(differentAccount).toBeVisible();
        await differentAccount.click();

        // Back on the sign-in start, where a different account can be used.
        await expect(u.po.signIn.getIdentifierInput()).toBeVisible();
      } finally {
        await user.deleteIfExists();
      }
    });
  },
);
