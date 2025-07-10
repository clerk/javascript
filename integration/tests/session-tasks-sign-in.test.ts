import { createClerkClient } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { instanceKeys } from '../presets/envs';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';
import { createUserService } from '../testUtils/usersService';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSessionTasks] })(
  'session tasks after sign-in flow @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser);
    });

    test.afterAll(async () => {
      const u = createTestUtils({ app });
      await fakeUser.deleteIfExists();
      await u.services.organizations.deleteAll();
      await app.teardown();
    });

    test('with email and password, navigate to task on after sign-in', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Performs sign-in
      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword(fakeUser.password);
      await u.po.signIn.continue();
      await u.po.expect.toBeSignedIn();

      // Redirects back to tasks when accessing protected route by `auth.protect`
      await u.page.goToRelative('/page-protected');
      expect(page.url()).toContain('tasks');

      // Resolves task
      const fakeOrganization = u.services.organizations.createFakeOrganization();
      await u.po.sessionTask.resolveForceOrganizationSelectionTask(fakeOrganization);
      await u.po.expect.toHaveResolvedTask();

      // Navigates to after sign-in
      await u.page.waitForAppUrl('/');
    });

    test('with sso, navigate to task on after sign-in', async ({ page, context }) => {
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

      // Performs sign-in with SSO
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

      // Navigates to after sign-in
      await u.page.waitForAppUrl('/');

      // Delete the user on the OAuth provider instance
      await fakeUser.deleteIfExists();
      // Delete the user on the app instance.
      await u.services.users.deleteIfExists({ email: fakeUser.email });
    });
  },
);
