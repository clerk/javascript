import type { ProtectConfigJSON } from '@clerk/shared/types';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

const mockProtectSettings = async (page: Page, config?: ProtectConfigJSON) => {
  await page.route('*/**/v1/environment*', async route => {
    const response = await route.fetch();
    const json = await response.json();
    const newJson = {
      ...json,
      ...(config ? { protect_config: config } : {}),
    };
    await route.fulfill({ response, json: newJson });
  });
};

testAgainstRunningApps({ withEnv: [appConfigs.envs.withProtectService] })(
  'Clerk Protect checks @generic',
  ({ app }) => {
    test.describe.configure({ mode: 'parallel' });

    test.afterAll(async () => {
      await app.teardown();
    });

    test('should add loader script when protect_config.loader is set', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await mockProtectSettings(page, {
        object: 'protect_config',
        id: 'n',
        loaders: [
          {
            rollout: 1.0,
            type: 'script',
            target: 'body',
            attributes: { id: 'test-protect-loader-1', type: 'module', src: 'data:application/json;base64,Cgo=' },
          },
        ],
      });
      await u.page.goToAppHome();
      await u.page.waitForClerkJsLoaded();

      await expect(page.locator('#test-protect-loader-1')).toHaveAttribute('type', 'module');
    });

    test('should not add loader script when protect_config.loader is set and rollout 0.00', async ({
      page,
      context,
    }) => {
      const u = createTestUtils({ app, page, context });
      await mockProtectSettings(page, {
        object: 'protect_config',
        id: 'n',
        loaders: [
          {
            rollout: 0, // force 0% rollout, should not materialize
            type: 'script',
            target: 'body',
            attributes: { id: 'test-protect-loader-2', type: 'module', src: 'data:application/json;base64,Cgo=' },
          },
        ],
      });
      await u.page.goToAppHome();
      await u.page.waitForClerkJsLoaded();

      await expect(page.locator('#test-protect-loader-2')).toHaveCount(0);
    });

    test('should not create loader element when protect_config.loader is not set', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await mockProtectSettings(page);
      await u.page.goToAppHome();
      await u.page.waitForClerkJsLoaded();

      // Playwright locators are always objects, never undefined
      await expect(page.locator('#test-protect-loader')).toHaveCount(0);
    });
  },
);
