import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';

test.describe('prefetchUI disabled @nextjs', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter.clone().commit();
    await app.setup();
    // Use withEmailCodes but disable the UI prefetching
    const env = appConfigs.envs.withEmailCodes.clone().setEnvVariable('public', 'CLERK_PREFETCH_UI_DISABLED', 'true');
    await app.withEnv(env);
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('does not inject clerk-ui script when prefetchUI is disabled', async ({ page }) => {
    await page.goto(app.serverUrl);

    // Wait for clerk-js script to be present (ensures page has loaded)
    await expect(page.locator('script[data-clerk-js-script]')).toBeAttached();

    // clerk-ui script should NOT be present
    await expect(page.locator('script[data-clerk-ui-script]')).not.toBeAttached();
  });
});
