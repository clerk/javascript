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

    await fakeUser.deleteIfExists();
  });

  test('with pending tasks, redirects to tasks when accessing root sign in', async ({ page, context }) => {
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
    await u.po.signIn.goTo();
    await expect(u.page.getByRole('heading', { name: 'Create Organization' })).toBeVisible();
  });
});
