import { test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';
import { testSignIn, testSignUp, testSSR } from './common';

test.describe('Next with ClerkJS V5 <-> Account Portal Core 1 @ap-flows', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouterAPWithClerkNextLatest.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withAPCore1ClerkLatest);
    await app.dev();
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser();
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('sign in', async ({ page, context }) => {
    await testSignIn({ app, page, context, fakeUser });
  });

  test('sign up', async ({ page, context }) => {
    await testSignUp({ app, page, context, fakeUser });
  });

  test('ssr', async ({ page, context }) => {
    await testSSR({ app, page, context, fakeUser });
  });
});
