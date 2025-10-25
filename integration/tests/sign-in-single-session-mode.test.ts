import type { FakeUser } from '@clerk/testing/playwright';
import { test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

/**
 * Tests for single-session mode behavior using the withBilling environment
 * which is configured for single-session mode in the Clerk Dashboard.
 */
testAgainstRunningApps({ withEnv: [appConfigs.envs.withBilling] })(
  'sign in with active session in single-session mode @generic @nextjs',
  ({ app }) => {
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
      await fakeUser.deleteIfExists();
    });

    test('redirects to afterSignIn URL when visiting /sign-in with active session in single-session mode', async ({
      page,
      context,
    }) => {
      const u = createTestUtils({ app, page, context });

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();
      await u.page.waitForAppUrl('/');

      await u.po.signIn.goTo();
      await u.page.waitForAppUrl('/');
      await u.po.expect.toBeSignedIn();
    });

    test('does NOT show account switcher in single-session mode', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/sign-in/choose');
      await u.page.waitForAppUrl('/');
    });

    test('shows sign-in form when no active session in single-session mode', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.page.context().clearCookies();
      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.page.waitForSelector('text=/email address|username|phone/i');
      await u.page.waitForURL(/sign-in$/);
    });

    test('can sign in normally when not already authenticated in single-session mode', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.page.context().clearCookies();
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();
      await u.page.waitForAppUrl('/');
    });
  },
);
