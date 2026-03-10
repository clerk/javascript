import { test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';
import { testHandshakeRecovery, testSignIn, testSignOut, testSignUp, testSSR } from './common';

test.describe('Next with ClerkJS V7 <-> Account Portal Core 3 @ap-flows', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    test.setTimeout(90_000); // Wait for app to be ready
    app = await appConfigs.next.appRouterAPWithClerkNextLatest.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withAPCore3ClerkLatest);
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

  test('sign out clears session and AP state', async ({ page, context }) => {
    await testSignOut({ app, page, context, fakeUser });
  });

  test('handshake recovery after session cookie loss', async ({ page, context }) => {
    await testHandshakeRecovery({ app, page, context, fakeUser });
  });
});
