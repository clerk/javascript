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

  test('on after sign-in, navigates to tasks', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();
    await expect(u.page.getByRole('heading', { name: 'Create Organization' })).toBeVisible();
    expect(u.page.url()).toContain('/sign-in/add-organization');
  });

  test.fixme('redirects to after sign-in url when session tasks has been resolved', () => {
    // todo
  });

  test.fixme('redirects to after sign-in url when accessing root sign in with a active session', {
    // todo
  });

  test('redirects back to tasks when accessing root sign in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();
    await expect(u.page.getByRole('heading', { name: 'Create Organization' })).toBeVisible();
    expect(u.page.url()).toContain('/sign-in/add-organization');
    await u.po.signIn.goTo();
    await expect(u.page.getByRole('heading', { name: 'Create Organization' })).toBeVisible();
    expect(u.page.url()).toContain('/sign-in/add-organization');
  });

  test('without a session, does not allow to access tasks', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goto('/sign-in/add-organization');
    expect(u.page.url()).not.toContain('/sign-in/add-organization');
  });
});
