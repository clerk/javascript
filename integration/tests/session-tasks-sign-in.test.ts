import { test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';
import type { FakeOrganization } from '../testUtils/organizationsService';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSessionTasks] })(
  'session tasks after sign-in flow @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;
    let fakeOrganization: FakeOrganization;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser();
      fakeOrganization = u.services.organizations.createFakeOrganization();
      await u.services.users.createBapiUser(fakeUser);
    });

    test.afterAll(async () => {
      const u = createTestUtils({ app });
      await fakeUser.deleteIfExists();
      await u.services.organizations.deleteAll();
      await app.teardown();
    });

    test('navigate to task on after sign-in', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Performs sign-in
      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword(fakeUser.password);
      await u.po.signIn.continue();
      await u.po.expect.toBeSignedIn();

      // Resolves task
      await u.po.sessionTask.resolveForceOrganizationSelectionTask(fakeOrganization);
      await u.po.expect.toHaveResolvedTasks();

      // Navigates to after sign-in
      await u.page.waitForAppUrl('/');
    });
  },
);
