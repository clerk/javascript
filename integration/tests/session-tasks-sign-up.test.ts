import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { createTestUtils } from '../testUtils';

test.describe('session tasks sign in flow @nextjs', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withSessionTasks);
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('on after sign-up, navigates to tasks', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
    });
    await u.po.signUp.goTo();
    await u.po.signUp.signUpWithEmailAndPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });
    await u.po.signUp.enterTestOtpCode();
    await u.po.expect.toBeSignedIn();

    await expect(u.page.getByRole('heading', { name: 'Create Organization' })).toBeVisible();
    expect(u.page.url()).toContain('/sign-up/add-organization');

    await fakeUser.deleteIfExists();
  });

  test.fixme('redirects to after sign-up url when session tasks has been resolved', () => {
    // todo
  });

  test.fixme('redirects to after sign-up url when accessing root sign in with a active session', {
    // todo
  });

  test('redirects back to tasks when accessing root sign in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
    });
    await u.po.signUp.goTo();
    await u.po.signUp.signUpWithEmailAndPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });
    await u.po.signUp.enterTestOtpCode();
    await u.po.expect.toBeSignedIn();
    await expect(u.page.getByRole('heading', { name: 'Create Organization' })).toBeVisible();
    expect(u.page.url()).toContain('/sign-up/add-organization');
    await u.po.signIn.goTo();
    await expect(u.page.getByRole('heading', { name: 'Create Organization' })).toBeVisible();
    expect(u.page.url()).toContain('/sign-up/add-organization');
  });

  test('without a session, does not allow to access tasks', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goto('/sign-up/add-organization');
    expect(u.page.url()).not.toContain('/sign-up/add-organization');
  });
});
