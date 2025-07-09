import { expect, test } from '@playwright/test';

import { createClerkClient } from '@clerk/backend';
import { appConfigs } from '../presets';
import { instanceKeys } from '../presets/envs';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';
import { createUserService } from '../testUtils/usersService';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSessionTasks] })(
  'session tasks after sign-up flow @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;
    test.afterAll(async () => {
      const u = createTestUtils({ app });
      await u.services.organizations.deleteAll();
      await fakeUser.deleteIfExists();
      await app.teardown();
    });

    test.skip('navigate to task on after sign-up', async ({ page, context }) => {
      // Performs sign-up
      const u = createTestUtils({ app, page, context });
      fakeUser = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPhoneNumber: true,
        withUsername: true,
      });

      await u.po.signUp.goTo();
      await u.po.signUp.signUpWithEmailAndPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });
      await u.po.expect.toBeSignedIn();

      // Redirects back to tasks when accessing protected route by `auth.protect`
      await u.page.goToRelative('/page-protected');
      expect(page.url()).toContain('tasks');

      // Resolves task
      const fakeOrganization = u.services.organizations.createFakeOrganization();
      await u.po.sessionTask.resolveForceOrganizationSelectionTask(fakeOrganization);
      await u.po.expect.toHaveResolvedTask();

      // Navigates to after sign-up
      await u.page.waitForAppUrl('/');
    });

    test.skip('with sso, navigate to task on after sign-up', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Create a clerkClient for the OAuth provider instance
      const client = createClerkClient({
        secretKey: instanceKeys.get('oauth-provider').sk,
        publishableKey: instanceKeys.get('oauth-provider').pk,
      });
      const users = createUserService(client);
      fakeUser = users.createFakeUser({
        withUsername: true,
      });
      // Create the user on the OAuth provider instance so we do not need to sign up twice
      await users.createBapiUser(fakeUser);

      // Performs sign-up (transfer flow with sign-in) with SSO
      await u.po.signIn.goTo();
      await u.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();
      await u.page.getByText('Sign in to oauth-provider').waitFor();
      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.continue();
      await u.po.signIn.enterTestOtpCode();

      // Resolves task
      const fakeOrganization = u.services.organizations.createFakeOrganization();
      await u.po.sessionTask.resolveForceOrganizationSelectionTask(fakeOrganization);
      await u.po.expect.toHaveResolvedTask();

      // Navigates to after sign-up
      await u.page.waitForAppUrl('/');

      // Delete the user on the OAuth provider instance
      await fakeUser.deleteIfExists();
      // Delete the user on the app instance.
      await u.services.users.deleteIfExists({ email: fakeUser.email });
    });
  },
);
