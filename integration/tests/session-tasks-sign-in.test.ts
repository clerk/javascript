import { createClerkClient } from '@clerk/backend';
import { test } from '@playwright/test';

import { appConfigs } from '../presets';
import { instanceKeys } from '../presets/envs';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';
import { createUserService } from '../testUtils/usersService';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSessionTasks] })(
  'session tasks after sign-in flow @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let user: FakeUser;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      user = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(user);
    });

    test.afterAll(async () => {
      const u = createTestUtils({ app });
      await user.deleteIfExists();
      await u.services.organizations.deleteAll();
      await app.teardown();
    });

    test.afterEach(async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.signOut();
      await u.page.context().clearCookies();
    });

    test('with email and password, navigate to task on after sign-in', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Performs sign-in
      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(user.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword(user.password);
      await u.po.signIn.continue();
      await u.po.expect.toBeSignedIn();

      // Redirects back to tasks when accessing protected route by `auth.protect`
      await u.page.goToRelative('/page-protected');

      // Resolves task
      const fakeOrganization = Object.assign(u.services.organizations.createFakeOrganization(), {
        slug: u.services.organizations.createFakeOrganization().slug + '-with-sign-in-password',
      });
      await u.po.signIn.waitForMounted();
      await u.po.sessionTask.resolveForceOrganizationSelectionTask(fakeOrganization);
      await u.po.expect.toHaveResolvedTask();

      // Navigates to after sign-in
      await u.page.waitForAppUrl('/page-protected');
    });

    test('with sso, navigate to task on after sign-in', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Create a clerkClient for the OAuth provider instance
      const client = createClerkClient({
        secretKey: instanceKeys.get('oauth-provider').sk,
        publishableKey: instanceKeys.get('oauth-provider').pk,
      });
      const users = createUserService(client);
      const userFromOAuth = users.createFakeUser({
        withUsername: true,
      });
      // Create the user on the OAuth provider instance so we do not need to sign up twice
      await users.createBapiUser(userFromOAuth);

      // Performs sign-in with SSO
      await u.po.signIn.goTo();
      await u.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();
      await u.page.getByText('Sign in to oauth-provider').waitFor();
      await u.po.signIn.setIdentifier(userFromOAuth.email);
      await u.po.signIn.continue();
      await u.po.signIn.enterTestOtpCode();

      // Resolves task
      await u.po.signUp.waitForMounted();
      const fakeOrganization = Object.assign(u.services.organizations.createFakeOrganization(), {
        slug: u.services.organizations.createFakeOrganization().slug + '-with-sign-in-sso',
      });
      await u.po.sessionTask.resolveForceOrganizationSelectionTask(fakeOrganization);
      await u.po.expect.toHaveResolvedTask();

      // Navigates to after sign-in
      await u.page.waitForAppUrl('/');

      // Delete the user on the OAuth provider instance
      await userFromOAuth.deleteIfExists();
      // Delete the user on the app instance.
      await u.services.users.deleteIfExists({ email: userFromOAuth.email });
    });
  },
);
