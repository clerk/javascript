import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { createTestUtils } from '../testUtils';

test.describe('next build @remix', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    app = await appConfigs.remix.remixNode.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodes);
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('supports returning defer() from loader', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToStart();
    await expect(page.getByText('Deferred value: bar')).toBeVisible();
  });
});
