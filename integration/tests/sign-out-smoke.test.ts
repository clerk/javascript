import { expect, test } from '@playwright/test';

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

  test('sign out through all open tabs at once', async ({ page, context }) => {
    const mainTab = createTestUtils({ app, page, context });
    await mainTab.page.addInitScript(() => {
      /**
       * Playwright may define connection incorrectly, we are overriding to null
       */
      if (
        navigator.onLine &&
        // @ts-expect-error Cannot find `connection`
        (navigator?.connection?.rtt === 0 || navigator?.downlink?.rtt === 0)
      ) {
        Object.defineProperty(Object.getPrototypeOf(navigator), 'connection', { value: null });
      }
    });
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

  test('sign out persisting client', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();
    await u.page.goToAppHome();
    const client_id_element = await u.page.waitForSelector('p[data-clerk-id]', { state: 'attached' });
    const client_id = await client_id_element.innerHTML();

    await u.page.evaluate(async () => {
      await window.Clerk.signOut();
    });

    await u.po.expect.toBeSignedOut();
    await u.page.waitForSelector('p[data-clerk-session]', { state: 'detached' });

    const client_id_after_sign_out = await u.page.locator('p[data-clerk-id]').innerHTML();
    expect(client_id).toEqual(client_id_after_sign_out);
  });
});

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes_destroy_client] })(
  'sign out with destroy client smoke test @generic',
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

    test('sign out destroying client', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword(fakeUser.password);
      await u.po.signIn.continue();
      await u.po.expect.toBeSignedIn();
      await u.page.goToAppHome();

      await u.page.waitForSelector('p[data-clerk-id]', { state: 'attached' });

      await u.page.evaluate(async () => {
        await window.Clerk.signOut();
      });

      await u.po.expect.toBeSignedOut();
      await u.page.waitForSelector('p[data-clerk-id]', { state: 'detached' });
      await u.page.waitForSelector('p[data-clerk-session]', { state: 'detached' });
    });
  },
);
