import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';

const commonSetup = appConfigs.next.appRouter.clone();

test.describe('Keyless mode | middleware authorization @nextjs', () => {
  test.describe.configure({ mode: 'serial' });

  test.use({
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '',
    },
  });

  let app: Application;

  test.beforeAll(async () => {
    app = await commonSetup.commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withKeyless);
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('auth.protect() in middleware redirects to sign-in during keyless bootstrap', async ({ page }) => {
    await page.goto(`${app.serverUrl}/protected`);
    await page.waitForURL(/\/sign-in/);
    await expect(page.getByTestId('protected')).not.toBeVisible();
  });
});
