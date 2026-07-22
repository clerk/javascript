import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('vinext @vinext @auth-state', () => {
  test.describe.configure({ mode: 'serial' });

  let app: Application;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    test.setTimeout(120_000);
    app = await appConfigs.vinext.app.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodes);
    await app.dev();

    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser();
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('first visit shows signed-out state', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();

    await u.po.expect.toBeSignedOut();
    await expect(u.page.getByText('server-signed-out')).toBeVisible();
  });

  test('page refresh preserves signed-in state', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await page.reload();
    await u.page.waitForClerkJsLoaded();

    await u.po.expect.toBeSignedIn();
    await expect(u.page.getByText(/server-user-id:/)).toBeVisible();
  });

  test('new tab shares auth state', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToAppHome();
    const mainUserId = await u.page.locator('p[data-clerk-user-id]').getAttribute('data-clerk-user-id');
    expect(mainUserId).toBeTruthy();

    await u.tabs.runInNewTab(async m => {
      await m.page.goToAppHome();
      await m.page.waitForClerkJsLoaded();

      await m.po.expect.toBeSignedIn();

      const tabUserId = await m.page.locator('p[data-clerk-user-id]').getAttribute('data-clerk-user-id');
      expect(tabUserId).toBe(mainUserId);
    });
  });

  test('sign out clears auth state', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToAppHome();
    await u.po.userButton.waitForMounted();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();
    await u.po.userButton.triggerSignOut();

    await u.po.expect.toBeSignedOut();

    await page.reload();
    await u.page.waitForClerkJsLoaded();

    await u.po.expect.toBeSignedOut();
    await expect(u.page.getByText('server-signed-out')).toBeVisible();
  });

  test('server and client auth state match', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();

    const serverUserId = await u.page.locator('p[data-clerk-user-id]').getAttribute('data-clerk-user-id');
    expect(serverUserId).toBeTruthy();

    const clientUserId = await page.evaluate(() => window.Clerk?.user?.id);
    expect(clientUserId).toBeTruthy();

    expect(serverUserId).toBe(clientUserId);
  });
});
