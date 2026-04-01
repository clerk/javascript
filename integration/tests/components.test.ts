import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeOrganization, FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('component smoke tests @generic', ({ app }) => {
  let fakeUser: FakeUser;
  let fakeOrganization: FakeOrganization;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser({
      withPhoneNumber: true,
      withUsername: true,
    });
    const user = await u.services.users.createBapiUser(fakeUser);
    fakeOrganization = await u.services.users.createFakeOrganization(user.id);
  });

  test.afterAll(async () => {
    await app.teardown();
    await fakeUser.deleteIfExists();
    await fakeOrganization.delete();
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
      name: 'UserAvatar',
      path: '/user-avatar',
      protected: true,
      fallback: 'Loading user avatar',
    },
    {
      name: 'UserButton',
      path: '/user-button',
      protected: true,
      fallback: 'Loading user button',
    },
    {
      name: 'Waitlist',
      path: '/waitlist',
      fallback: 'Loading waitlist',
    },
    {
      name: 'OrganizationSwitcher',
      path: '/organization-switcher',
      fallback: 'Loading organization switcher',
      protected: true,
    },
    {
      name: 'OrganizationProfile',
      path: '/organization-profile',
      fallback: 'Loading organization profile',
      protected: true,
    },
    {
      name: 'OrganizationList',
      path: '/organization-list',
      fallback: 'Loading organization list',
      protected: true,
    },
    {
      name: 'CreateOrganization',
      path: '/create-organization',
      fallback: 'Loading create organization',
      protected: true,
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
    await u.page.waitForClerkJsLoaded();
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
      await u.page.goToRelative(component.path, { waitUntil: 'commit' });
      await expect(u.page.getByText(component.fallback)).toBeVisible();

      // eslint-disable-next-line playwright/no-conditional-in-test
      if (component.protected) {
        await signOut({ app, page, context });
      }
    });
  }
});
