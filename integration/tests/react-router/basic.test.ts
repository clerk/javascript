import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes], withPattern: ['react-router.node'] })(
  'basic tests for @react-router with middleware',
  ({ app }) => {
    test.describe.configure({ mode: 'parallel' });

    let fakeUser: FakeUser;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPhoneNumber: true,
        withUsername: true,
      });
      await u.services.users.createBapiUser(fakeUser);
    });

    test.afterAll(async () => {
      await fakeUser.deleteIfExists();
      await app.teardown();
    });

    test.afterEach(async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.signOut();
      await u.page.context().clearCookies();
    });

    test('can sign in and user button renders', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();

      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.setPassword(fakeUser.password);
      await u.po.signIn.continue();
      await u.po.expect.toBeSignedIn();

      await u.page.waitForAppUrl('/');

      await u.po.userButton.waitForMounted();
      await u.po.userButton.toggleTrigger();
      await u.po.userButton.waitForPopover();

      await u.po.userButton.toHaveVisibleMenuItems([/Manage account/i, /Sign out$/i]);
    });

    test('redirects to sign-in when unauthenticated', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.page.goToRelative('/protected');
      await u.page.waitForURL(`${app.serverUrl}/sign-in`);
      await u.po.signIn.waitForMounted();
    });

    test('renders control components contents', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.page.goToAppHome();
      await expect(u.page.getByText('SignedOut')).toBeVisible();

      await u.page.goToRelative('/sign-in');
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();
      await expect(u.page.getByText('SignedIn')).toBeVisible();
    });

    test('renders user profile with SSR data', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.page.goToRelative('/sign-in');
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();

      await u.po.userButton.waitForMounted();
      await u.page.goToRelative('/protected');
      await u.po.userProfile.waitForMounted();

      // Fetched from an API endpoint (/api/me), which is server-rendered.
      // This also verifies that the server middleware is working.
      await expect(u.page.getByText(`First name: ${fakeUser.firstName}`)).toBeVisible();
      await expect(u.page.getByText(`Email: ${fakeUser.email}`)).toBeVisible();
    });
  },
);
