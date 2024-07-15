import { expect, test } from '@playwright/test';

import type { FakeUser } from '../../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../../testUtils';

testAgainstRunningApps({ withPattern: ['astro.node.withCustomRoles'] })(
  'basic flows for @astro with react',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });
    let fakeUser: FakeUser;

    test.beforeAll(async () => {
      const m = createTestUtils({ app });
      fakeUser = m.services.users.createFakeUser();
      await m.services.users.createBapiUser(fakeUser);
    });

    test.afterAll(async () => {
      await fakeUser.deleteIfExists();
      await app.teardown();
    });

    test('render user button', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/react/sign-in#/?redirect_url=/react');
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.page.waitForAppUrl('/react');
      await u.po.expect.toBeSignedIn();

      await u.po.userButton.waitForMounted();
      await u.po.userButton.toggleTrigger();
      await u.po.userButton.waitForPopover();

      await u.po.userButton.toHaveVisibleMenuItems([/Manage account/i, /Sign out$/i]);

      await u.po.userButton.triggerManageAccount();
      await u.po.userProfile.waitForUserProfileModal();

      await expect(u.page.getByText(/profile details/i)).toBeVisible();
    });

    test('render user profile with streamed data', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/react/sign-in#/?redirect_url=/react');
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();
      await u.po.userButton.waitForMounted();
      await u.page.goToRelative('/react/user');
      await u.po.userProfile.waitForMounted();

      await expect(u.page.getByText(`My name is: ${fakeUser.firstName}`)).toBeVisible();

      // Streams data from Astro.locals.currentUser()
      await expect(u.page.getByText(`"firstName":"${fakeUser.firstName}"`)).toBeVisible();
    });

    test('SignedIn, SignedOut SSR', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/react');
      await expect(u.page.getByText('Go to this page to log in')).toBeVisible();
      await u.page.goToRelative('/react/sign-in#/?redirect_url=/react');
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();
      await expect(u.page.getByText('Go to this page to see your profile')).toBeVisible();
      await expect(u.page.getByText('Sign out!')).toBeVisible();
    });

    test('render content based on Clerk loaded status', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/utility');
      await expect(u.page.getByText('Clerk is loading')).toBeVisible();
      await expect(u.page.getByText('Clerk is loaded')).toBeHidden();
      await u.page.waitForClerkJsLoaded();
      await expect(u.page.getByText('Clerk is loaded')).toBeVisible();
      await expect(u.page.getByText('Clerk is loading')).toBeHidden();
    });
  },
);
