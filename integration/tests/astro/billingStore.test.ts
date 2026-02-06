import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { createTestUtils } from '../../testUtils';

test.describe('Astro billingStore @astro @billing', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    test.setTimeout(90_000); // Wait for app to be ready

    app = await appConfigs.astro.node.clone().commit();

    await app.setup();
    await app.withEnv(appConfigs.envs.withBilling);
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('should render plans from getPlans()', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/billing/billing-store');

    await u.page.waitForClerkJsLoaded();

    await expect(u.page.getByText('Free')).toBeVisible();
    await expect(u.page.getByText('Plus')).toBeVisible();
    await expect(u.page.getByText('Pro')).toBeVisible();
    await expect(u.page.getByText('Trial')).toBeVisible();
  });
});
