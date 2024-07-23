import { test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('sign out smoke test @generic', ({ app }) => {
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

  test('sign out throught all open tabs at once', async ({ page, context }) => {
    const mainTab = createTestUtils({ app, page, context });
    await mainTab.po.signIn.goTo();
    await mainTab.po.signIn.setIdentifier(fakeUser.email);
    await mainTab.po.signIn.continue();
    await mainTab.po.signIn.setPassword(fakeUser.password);
    await mainTab.po.signIn.continue();
    await mainTab.po.expect.toBeSignedIn();

    await mainTab.tabs.runInNewTab(async m => {
      await m.page.goToAppHome();

      await m.page.waitForClerkJsLoaded();

      await m.po.expect.toBeSignedIn();

      await m.page.evaluate(async () => {
        await window.Clerk.signOut();
      });

      await m.po.expect.toBeSignedOut();
    });

    await mainTab.po.expect.toBeSignedOut();
  });
});
