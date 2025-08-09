import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSessionTasks] })(
  'session tasks after sign-up flow @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;

    test.beforeEach(() => {
      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPhoneNumber: true,
        withUsername: true,
      });
    });

    test.afterAll(async () => {
      const u = createTestUtils({ app });
      await u.services.organizations.deleteAll();
      await fakeUser.deleteIfExists();
      await app.teardown();
    });

    test.afterEach(async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.signOut();
      await u.page.context().clearCookies();
    });

    test('navigate to task on after sign-up', async ({ page, context }) => {
      // Performs sign-up
      const u = createTestUtils({ app, page, context });
      await u.po.signUp.goTo();
      await u.po.signUp.signUpWithEmailAndPassword({
        email: fakeUser.email,
        password: fakeUser.password,
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
      await u.page.waitForAppUrl('/');
    });

    test('with sso, navigate to task on after sign-up', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.po.signUp.goTo();
      await u.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();

      await u.po.signIn.waitForMounted();
      await u.po.signIn.getGoToSignUp().click();

      await u.po.signUp.waitForMounted();
      await u.po.signUp.setEmailAddress(fakeUser.email);
      await u.po.signUp.continue();
      await u.po.signUp.enterTestOtpCode();

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
