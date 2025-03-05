import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { createTestUtils } from '../testUtils';

test.describe('session tasks after sign-up flow @nextjs', () => {
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

  test('navigate to task on after sign-up', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });
    await u.po.signUp.goTo();
    await u.po.signUp.signUpWithEmailAndPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });

    await expect(u.page.getByRole('button', { name: /create organization/i })).toBeVisible();
    expect(page.url()).toContain('add-organization');

    await fakeUser.deleteIfExists();
  });
});
