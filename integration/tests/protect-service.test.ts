import type { ProtectConfigJSON } from '@clerk/shared/types';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

const mockProtectSettings = async (page: Page, config: ProtectConfigJSON) => {
  await page.route('*/**/v1/environment*', async route => {
    const response = await route.fetch();
    const json = await response.json();
    const newJson = {
      ...json,
      protect_config: config,
    };
    await route.fulfill({ response, json: newJson });
  });
};

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('Hello World Div @xgeneric', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('should create script when protect_config.loader is set', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await mockProtectSettings(page, {
      object: 'protect_config',
      id: 'n',
      loader: {
        type: 'script',
        target: 'body',
        attributes: { id: 'test-protect-loader', type: 'module', src: 'data:application/json;base64,Cgo=' },
      },
    });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await expect(page.locator('#test-protect-loader')).toHaveAttribute('type', 'module');
  });

  test('should not create Hello World div when protect_config.loader is not set', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await mockProtectSettings(page, undefined);
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    expect(page.locator('#test-protect-loader')).toBeUndefined();
  });
});
