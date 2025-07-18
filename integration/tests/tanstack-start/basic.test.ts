import type { User } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

declare global {
  interface Window {
    __clerk_init_state?: any;
  }
}

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })(
  'basic tests for TanStack Start @tanstack-react-start',
  ({ app }) => {
    test.describe.configure({ mode: 'parallel' });

    let fakeUser: FakeUser;
    let bapiUser: User;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPhoneNumber: true,
        withUsername: true,
      });
      bapiUser = await u.services.users.createBapiUser(fakeUser);
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

    test('clerk handler has ran', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();

      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.setPassword(fakeUser.password);
      await u.po.signIn.continue();
      await u.po.expect.toBeSignedIn();

      await u.page.waitForAppUrl('/');

      const clerkInitialState = await u.page.waitForFunction(() => window.__clerk_init_state);

      expect(clerkInitialState !== undefined).toBeTruthy();
    });

    test('retrieve auth state in server functions', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.page.goToRelative('/user');

      await expect(u.page.getByText('You are not signed in')).toBeVisible();

      await u.po.signIn.goTo();

      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.setPassword(fakeUser.password);
      await u.po.signIn.continue();
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/user');

      await expect(u.page.getByText(`Welcome! Your ID is ${bapiUser.id}!`)).toBeVisible();
    });

    test('clerk handler sets headers', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const r = await u.po.signIn.goTo();

      expect(r.headers()).toMatchObject({
        'x-clerk-auth-reason': 'session-token-and-uat-missing',
        'x-clerk-auth-status': 'signed-out',
      });
    });
  },
);
