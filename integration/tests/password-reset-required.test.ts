import { createClerkClient } from '@clerk/backend';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { resolveInstanceKeys } from '../presets/envs';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';
import { withRetry } from '../testUtils/retryableClerkClient';
import { createUserService } from '../testUtils/usersService';

const resetRequiredMessage = 'You need to reset your password before you can use it again.';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('password reset required @nextjs', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

  let providerUsers: ReturnType<typeof createUserService>;
  const users: FakeUser[] = [];

  test.beforeAll(async () => {
    const providerKeys = await resolveInstanceKeys('oauth-provider');
    providerUsers = createUserService(
      withRetry(createClerkClient({ secretKey: providerKeys.sk, publishableKey: providerKeys.pk })),
    );
  });

  test.afterAll(async () => {
    const u = await createTestUtils({ app });
    for (const user of users) {
      await user.deleteIfExists();
      await u.services.users.deleteIfExists({ email: user.email });
    }
    await app.teardown();
  });

  const signInWithOAuthToUserWithReservedEmail = async (u: Awaited<ReturnType<typeof createTestUtils>>) => {
    const user = providerUsers.createFakeUser(test, { withUsername: true });
    users.push(user);
    await providerUsers.createBapiUser(user);
    await u.services.clerk.users.createUser({
      emailAddress: [user.email],
      emailAddressIdentificationStatus: ['reserved'],
      password: user.password,
    });

    await u.po.signIn.goTo();
    await u.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();
    await u.page.getByText(/Sign in to .*oauth-provider/).waitFor();
    await u.po.signIn.setIdentifier(user.email);
    await u.po.signIn.continue();
    await u.po.signIn.enterTestOtpCode();
    await grantOAuthConsent(u.page);
    await u.page.getByText('SignedIn').waitFor();
    await u.po.expect.toBeSignedIn();

    return user;
  };

  const signOut = async (u: Awaited<ReturnType<typeof createTestUtils>>) => {
    await u.page.signOut();
    await u.page.context().clearCookies();
  };

  test('password step offers the reset, which signs the user in', async ({ page, context }) => {
    const u = await createTestUtils({ app, page, context });
    const user = await signInWithOAuthToUserWithReservedEmail(u);
    await signOut(u);

    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(user.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(user.password);
    await u.po.signIn.continue();

    await expect(u.page.getByText('Password reset required')).toBeVisible();
    await expect(u.page.getByText(resetRequiredMessage)).toBeVisible();
    await expect(u.po.signIn.getAltMethodsEmailCodeButton()).toBeVisible();
    await expect(u.page.getByText('Back', { exact: true })).toBeHidden();

    await u.po.signIn.getResetPassword().click();
    await u.po.signIn.enterTestOtpCode();
    const newPassword = `${user.password}_reset`;
    await u.po.signIn.setPassword(newPassword);
    await u.po.signIn.setPasswordConfirmation(newPassword);
    await u.po.signIn.getResetPassword().click();
    await u.po.expect.toBeSignedIn();
  });

  test('password entered on the first step goes straight to the reset', async ({ page, context }) => {
    const u = await createTestUtils({ app, page, context });
    const user = await signInWithOAuthToUserWithReservedEmail(u);
    await signOut(u);

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: user.email,
      password: user.password,
      waitForSession: false,
    });

    await expect(u.page.getByText('Password reset required')).toBeVisible();
    await expect(u.page.getByText(resetRequiredMessage)).toBeVisible();
    await expect(u.po.signIn.getPasswordInput()).toBeHidden();
    await expect(u.po.signIn.getResetPassword()).toBeVisible();
    await u.po.expect.toBeSignedOut();
  });

  test('reverification resets the password while saving a new one', async ({ page, context }) => {
    const u = await createTestUtils({ app, page, context });
    const user = await signInWithOAuthToUserWithReservedEmail(u);

    await u.po.userProfile.goTo();
    await u.po.userProfile.waitForMounted();
    await u.po.userProfile.switchToSecurityTab();
    await u.page.waitForFunction(async () => {
      await window.Clerk.session.startVerification({ level: 'first_factor' });
    });

    await u.page.getByRole('button', { name: /update password/i }).click();
    const newPassword = `${user.password}_new`;
    await u.page.locator('input[name=newPassword]').fill(newPassword);
    await u.page.locator('input[name=confirmPassword]').fill(newPassword);
    await u.page.getByRole('button', { name: /^save$/i }).click();

    await u.po.userVerification.waitForMounted();
    await u.po.userVerification.setPassword(user.password);
    await u.po.userVerification.continue();

    await expect(u.page.getByText('Password reset required')).toBeVisible();
    await expect(
      u.page.getByText("Your current password needs to be reset. Confirm it's you to save your new password."),
    ).toBeVisible();

    await u.po.userVerification.getAltMethodsEmailCodeButton().first().click();
    await u.po.userVerification.enterTestOtpCode();
    await u.po.userVerification.waitForClosed();

    await signOut(u);
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: user.email, password: newPassword });
    await u.po.expect.toBeSignedIn();
  });
});

const grantOAuthConsent = async (page: Page) => {
  const allowAccessButton = page.getByRole('button', { name: 'Allow' });
  await expect(allowAccessButton).toBeVisible();
  await allowAccessButton.click();
};
