import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('session tasks sign in flow @nextjs', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withSessionTasks);
    await app.dev();

    const m = createTestUtils({ app });
    fakeUser = m.services.users.createFakeUser({
      withPhoneNumber: true,
      withUsername: true,
    });
    await m.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('navigate to task on after sign-in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();

    const addOrganizationTask = u.page.getByText(/choose an organization/i);
    await expect(addOrganizationTask).toBeVisible();
    expect(page.url()).toContain('add-organization');
  });

  test('redirect to task when accessing root sign in component', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();

    // Navigates to task
    const addOrganizationTask = u.page.getByText(/choose an organization/i);
    await expect(addOrganizationTask).toBeVisible();
    expect(page.url()).toContain('add-organization');

    // Tries to go back to root sign-in
    await u.po.signIn.goTo();

    // Get redirected back to task
    await expect(addOrganizationTask).toBeVisible();
    expect(page.url()).toContain('add-organization');
  });
});
