import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('sign-in-or-up restricted mode @nextjs', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    test.setTimeout(90_000); // Wait for app to be ready
    app = await appConfigs.next.appRouter.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withSignInOrUpwithRestrictedModeFlow);
    await app.dev();

    const m = createTestUtils({ app });
    fakeUser = m.services.users.createFakeUser();
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('It does not allow sign-in-or-up flow', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await expect(u.page.getByText(/continue to/i)).toBeHidden();
    await u.po.signIn.getIdentifierInput().fill(fakeUser.email);
    await u.po.signIn.continue();
    await expect(u.page.getByTestId('form-feedback-error')).toBeVisible();
    await expect(u.page.getByTestId('form-feedback-error')).toHaveText(/Couldn't find your account\./i);
  });
});
