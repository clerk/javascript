import { createClerkClient } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { environmentConfig } from '../models/environment';
import { appConfigs } from '../presets';
import { resolveInstanceKeys } from '../presets/envs';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';
import { withRetry } from '../testUtils/retryableClerkClient';
import { createUserService } from '../testUtils/usersService';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSessionTasks] })(
  'session tasks after sign-up flow @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let regularFakeUser: FakeUser;
    let fakeUserForOAuth: FakeUser;

    test.beforeEach(async () => {
      const u = await createTestUtils({ app });
      regularFakeUser = u.services.users.createFakeUser(test, {
        fictionalEmail: true,
        withPhoneNumber: true,
        withUsername: true,
      });
      fakeUserForOAuth = u.services.users.createFakeUser(test, {
        fictionalEmail: true,
        withPhoneNumber: true,
        withUsername: true,
      });
    });

    test.afterAll(async () => {
      const u = await createTestUtils({ app });
      await u.services.organizations.deleteAll();
      await regularFakeUser.deleteIfExists();

      // Delete user from OAuth provider instance
      const client = createClerkClient({
        secretKey: (await resolveInstanceKeys('oauth-provider')).sk,
        publishableKey: (await resolveInstanceKeys('oauth-provider')).pk,
      });
      const users = createUserService(withRetry(client));
      await users.deleteIfExists({ email: fakeUserForOAuth.email });

      await app.teardown();
    });

    test.afterEach(async ({ page, context }) => {
      const u = await createTestUtils({ app, page, context });
      await u.page.signOut();
      await u.page.context().clearCookies();
    });

    test('navigate to task on after sign-up', async ({ page, context }) => {
      // Performs sign-up
      const u = await createTestUtils({ app, page, context });
      await u.po.signUp.goTo();
      await u.po.signUp.signUpWithEmailAndPassword({
        email: regularFakeUser.email,
        password: regularFakeUser.password,
      });
      await u.po.expect.toBeSignedIn();

      // Redirects back to tasks when accessing protected route by `auth.protect`
      await u.page.goToRelative('/page-protected');
      expect(u.page.url()).toContain('tasks');

      // Resolves task
      const fakeOrganization = Object.assign(u.services.organizations.createFakeOrganization(), {
        slug: u.services.organizations.createFakeOrganization().slug + '-with-sign-up',
      });
      await u.po.sessionTask.resolveForceOrganizationSelectionTask(fakeOrganization);
      await u.po.expect.toHaveResolvedTask();

      // Navigates to after sign-up
      await u.page.waitForAppUrl('/page-protected');
    });

    test('with sso, navigate to task on after sign-up', async ({ page, context }) => {
      const u = await createTestUtils({ app, page, context });
      const providerKeys = await resolveInstanceKeys('oauth-provider');
      await createTestUtils({
        app: {
          ...app,
          env: environmentConfig()
            .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', providerKeys.pk)
            .setEnvVariable('private', 'CLERK_SECRET_KEY', providerKeys.sk),
        },
        page,
        context,
      });

      await u.po.signUp.goTo();
      await u.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();

      await u.po.signIn.waitForMounted();
      await u.po.signIn.getGoToSignUp().click();

      await u.po.signUp.waitForMounted();
      await u.po.signUp.setEmailAddress(fakeUserForOAuth.email);
      await u.po.signUp.continue();
      const [callback] = await Promise.all([
        page.waitForRequest(request => new URL(request.url()).pathname === '/v1/oauth_callback'),
        u.po.signUp.enterTestOtpCode(),
      ]);
      expect(new URL(callback.url()).searchParams.has('__clerk_testing_token')).toBe(true);

      // Resolves task
      await u.po.signUp.waitForMounted();
      const fakeOrganization = Object.assign(u.services.organizations.createFakeOrganization(), {
        slug: u.services.organizations.createFakeOrganization().slug + '-with-sign-in-sso',
      });
      await u.po.sessionTask.resolveForceOrganizationSelectionTask(fakeOrganization);
      await u.po.expect.toHaveResolvedTask();

      // Navigates to after sign-up
      await u.page.waitForAppUrl('/');
    });
  },
);
