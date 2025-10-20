import { test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })(
  'sign in redirect with active session @generic @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser1: FakeUser;
    let fakeUser2: FakeUser;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      fakeUser1 = u.services.users.createFakeUser({
        withPhoneNumber: true,
        withUsername: true,
      });
      fakeUser2 = u.services.users.createFakeUser({
        withPhoneNumber: true,
        withUsername: true,
      });
      await u.services.users.createBapiUser(fakeUser1);
      await u.services.users.createBapiUser(fakeUser2);
    });

    test.afterAll(async () => {
      await fakeUser1.deleteIfExists();
      await fakeUser2.deleteIfExists();
    });

    test('redirects to /sign-in/choose when visiting /sign-in with active session in multi-session mode', async ({
      page,
      context,
    }) => {
      const u = createTestUtils({ app, page, context });

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser1.email, password: fakeUser1.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToAppHome();
      await u.po.signIn.goTo();
      await u.page.waitForURL(/sign-in\/choose/);
      await u.page.waitForSelector('text=Choose an account');
    });

    test('shows active session in account switcher with option to add account', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser1.email, password: fakeUser1.password });
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
  },
);
