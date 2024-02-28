import { expect,test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser} from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodesQuickstart] })(
  'nextjs @quickstart',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser);
    });

    test.afterAll(async () => {
      await fakeUser.deleteIfExists();
      await app.teardown();
    });

    test('Clerk client loads on first visit and Sign In button renders', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToStart();

      await u.page.waitForClerkJsLoaded();

      await u.po.expect.toBeSignedOut();

      await expect(u.page.getByRole('button', { name: /Sign in/i })).toBeVisible();
    });

    test('can sign in with email and password', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToStart();
      await u.page.waitForClerkJsLoaded();
      await u.po.expect.toBeSignedOut();

      await u.page.getByRole('button', { name: /Sign in/i }).click();

      await u.po.signIn.waitForMounted();

      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

      await u.page.waitForURL(`${app.serverUrl}/`);

      await u.po.expect.toBeSignedIn();
      await expect(u.page.getByRole('button',{ name: /Open user button/i })).toBeVisible();

      await u.page.pause();
    });
  },
);
