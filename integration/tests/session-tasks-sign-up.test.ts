import { test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';
import type { FakeOrganization } from '../testUtils/organizationsService';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSessionTasks] })(
  'session tasks after sign-up flow @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;
    let fakeOrganization: FakeOrganization;

    test.beforeAll(() => {
      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPhoneNumber: true,
        withUsername: true,
      });
      fakeOrganization = u.services.organizations.createFakeOrganization();
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

      // Resolves task
      await u.po.sessionTask.resolveForceOrganizationSelectionTask(fakeOrganization);
      await u.po.expect.toHaveResolvedTasks();

      // Navigates to after sign-up
      await u.page.waitForAppUrl('/');
    });
  },
);
