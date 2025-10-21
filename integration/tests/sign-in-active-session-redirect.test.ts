import { test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })(
  'sign in redirect with active session @generic @nextjs',
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

    test('redirects to /sign-in/choose when visiting /sign-in with active session in multi-session mode', async ({
      page,
      context,
    }) => {
      const u = createTestUtils({ app, page, context });

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToAppHome();
      await u.po.signIn.goTo();
      await u.page.waitForURL(/sign-in\/choose/);
      await u.page.waitForSelector('text=Choose an account');
    });

    test('shows active session in account switcher with option to add account', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();

      await u.po.signIn.goTo();
      await u.page.waitForURL(/sign-in\/choose/);
      await u.po.signIn.waitForMounted();
      await u.page.getByText('Add account').waitFor({ state: 'visible' });
      await u.page.getByText('Choose an account').waitFor({ state: 'visible' });
    });

    test('shows sign-in form when no active sessions exist', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.page.context().clearCookies();
      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.page.waitForSelector('text=/email address|username|phone/i');
      await u.page.waitForURL(/sign-in$/);
    });

    test('clicking "Add account" from /choose shows sign-in form without redirecting back', async ({
      page,
      context,
    }) => {
      const u = createTestUtils({ app, page, context });

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();

      await u.po.signIn.goTo();
      await u.page.waitForURL(/sign-in\/choose/);

      await u.page.getByText('Add account').click();
      await u.page.waitForURL(/sign-in$/);
      await u.po.signIn.waitForMounted();
      await u.page.waitForSelector('text=/email address|username|phone/i');

      await u.page.waitForTimeout(500);
      const currentUrl = u.page.url();
      await u.page.waitForTimeout(500);
      const urlAfterWait = u.page.url();

      if (currentUrl !== urlAfterWait) {
        throw new Error(`URL changed from ${currentUrl} to ${urlAfterWait}, indicating a redirect loop`);
      }
    });
  },
);
