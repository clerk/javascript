import { expect, test } from '@playwright/test';

import { hash } from '../models/helpers';
import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSessionTasksResetPassword] })(
  'session tasks after sign-in reset password flow @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'parallel' });

    test.afterAll(async () => {
      await app.teardown();
    });

    test('resolve both reset password and organization selection tasks after sign-in', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      const user = u.services.users.createFakeUser();
      const createdUser = await u.services.users.createBapiUser(user);

      await u.services.users.passwordCompromised(createdUser.id);

      // Performs sign-in
      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(user.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword(user.password);
      await u.po.signIn.continue();

      // Wait for alternative methods to be visible, then check for error message
      const altMethodsButton = u.po.signIn.getAltMethodsEmailCodeButton();
      await expect(altMethodsButton).toBeVisible({ timeout: 10000 });

      await expect(
        u.page.getByText(
          'Your password may be compromised. To protect your account, please continue with an alternative sign-in method. You will be required to reset your password after signing in.',
        ),
      ).toBeVisible({ timeout: 10000 });
      await altMethodsButton.click();

      await u.page.getByRole('textbox', { name: 'code' }).click();
      await u.page.keyboard.type('424242', { delay: 100 });

      // Redirects back to tasks when accessing protected route by `auth.protect`
      await u.page.goToRelative('/page-protected');

      const newPassword = `${hash()}_testtest`;
      await u.po.sessionTask.resolveResetPasswordTask({
        newPassword: newPassword,
        confirmPassword: newPassword,
      });

      await u.po.sessionTask.resolveForceOrganizationSelectionTask({
        name: 'Test Organization',
      });

      // Navigates to after sign-in
      await u.page.waitForAppUrl('/page-protected');

      await u.page.signOut();
      await u.page.context().clearCookies();

      await user.deleteIfExists();
      await u.services.organizations.deleteAll();
    });

    test('sign-in with email and resolve the reset password task', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const user = u.services.users.createFakeUser();
      const createdUser = await u.services.users.createBapiUser(user);

      await u.services.users.passwordCompromised(createdUser.id);
      const fakeOrganization = u.services.organizations.createFakeOrganization();
      await u.services.organizations.createBapiOrganization({
        name: fakeOrganization.name,
        slug: fakeOrganization.slug + Date.now().toString(),
        createdBy: createdUser.id,
      });

      // Performs sign-in
      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(user.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword(user.password);
      await u.po.signIn.continue();

      // Wait for alternative methods to be visible, then check for error message
      const altMethodsButton = u.po.signIn.getAltMethodsEmailCodeButton();
      await expect(altMethodsButton).toBeVisible({ timeout: 10000 });

      await expect(
        u.page.getByText(
          'Your password may be compromised. To protect your account, please continue with an alternative sign-in method. You will be required to reset your password after signing in.',
        ),
      ).toBeVisible({ timeout: 10000 });
      await altMethodsButton.click();

      await u.page.getByRole('textbox', { name: 'code' }).click();
      await u.page.keyboard.type('424242', { delay: 100 });

      // Redirects back to tasks when accessing protected route by `auth.protect`
      await u.page.goToRelative('/page-protected');

      const newPassword = `${hash()}_testtest`;
      await u.po.sessionTask.resolveResetPasswordTask({
        newPassword: newPassword,
        confirmPassword: newPassword,
      });

      // Navigates to after sign-in
      await u.page.waitForAppUrl('/page-protected');

      await u.page.signOut();
      await u.page.context().clearCookies();

      await user.deleteIfExists();
      await u.services.organizations.deleteAll();
    });
  },
);
