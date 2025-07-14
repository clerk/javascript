import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSessionTasks] })(
  'session tasks after sign-up flow @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;

    test.beforeAll(() => {
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
  },
);
