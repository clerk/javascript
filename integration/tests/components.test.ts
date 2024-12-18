import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('component smoke tests @generic', ({ app }) => {
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

  const components = [
    {
      name: 'SignIn',
      path: '/sign-in',
      fallback: 'Loading sign in',
    },
    {
      name: 'SignUp',
      path: '/sign-up',
      fallback: 'Loading sign up',
    },
    {
      name: 'UserProfile',
      path: '/user',
      protected: true,
      fallback: 'Loading user profile',
    },
    {
      name: 'UserButton',
      path: '/user-button',
      protected: true,
      fallback: 'Loading user button',
    },
  ];

  const signIn = async ({ app, page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();
  };

  const signOut = async ({ app, page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.evaluate(async () => {
      await window.Clerk.signOut();
    });
  };

  for (const component of components) {
    test(`${component.name} supports fallback`, async ({ page, context }) => {
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (component.protected) {
        await signIn({ app, page, context });
      }

      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative(component.path);
      await expect(u.page.getByText(component.fallback)).toBeVisible();

      await signOut({ app, page, context });
    });
  }
});
