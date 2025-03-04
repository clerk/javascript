import { test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

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
      await fakeUser.deleteIfExists();
      await app.teardown();
    });

    test.fixme('on after sign-in, navigates to task', async () => {
      // todo
    });

    test.fixme('redirects back to task when accessing root sign in component', async () => {
      // todo
    });

    test.fixme('redirects to after sign-in url when accessing root sign in component with a active session', {
      // todo
    });

    test.fixme('redirects to after sign-in url once resolving task', () => {
      // todo
    });

    test.fixme('without a session, does not allow to access task component', async () => {
      // todo
    });
  },
);
