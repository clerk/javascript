import { test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('session tasks sign in flow @nextjs', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withSessionTasks);
    await app.dev();

    const m = createTestUtils({ app });
    fakeUser = m.services.users.createFakeUser({
      withPhoneNumber: true,
      withUsername: true,
    });
    await m.services.users.createBapiUser(fakeUser);
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
});
