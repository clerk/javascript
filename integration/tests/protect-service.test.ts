import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

const mockProtectSettings = async (page: Page, enabled: boolean) => {
  await page.route('*/**/v1/environment*', async route => {
    const response = await route.fetch();
    const json = await response.json();
    const newJson = {
      ...json,
      protect_settings: {
        enabled,
      },
    };
    await route.fulfill({ response, json: newJson });
  });
};

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('Hello World Div @xgeneric', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('should create Hello World div when protect_settings.enabled is true', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await mockProtectSettings(page, true);
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await expect(page.locator('#hello-world-div')).toBeVisible();
    await expect(page.locator('#hello-world-div')).toHaveText('Hello World');
  });

  test('should not create Hello World div when protect_settings.enabled is false', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await mockProtectSettings(page, false);
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await expect(page.locator('#hello-world-div')).toBeHidden();
  });
});
