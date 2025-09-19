import { test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({
  withEnv: [appConfigs.envs.withEmailCodes],
  withPattern: ['react.vite.withEmailCodes', 'vue.vite'],
})('UserAvatar component integration tests @generic', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser({
      withPhoneNumber: true,
      withUsername: true,
    });
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await app.teardown();
    await fakeUser.deleteIfExists();
  });

  test.afterEach(async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.signOut();
    await u.page.context().clearCookies();
  });

  test('UserAvatar loads and renders correctly when user is signed in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });
    await u.po.expect.toBeSignedIn();

    await u.po.userAvatar.goTo();
    await u.po.userAvatar.toBeVisible();
  });
});
