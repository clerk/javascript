import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSharedUIVariant] })(
  'shared React variant @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'parallel' });

    test('loads without __clerkSharedModules error when using shared UI variant', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const errors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      page.on('pageerror', error => {
        errors.push(error.message);
      });

      await page.route('**/ui.browser.js', async route => {
        const url = route.request().url().replace('ui.browser.js', 'ui.shared.browser.js');
        const response = await page.request.fetch(url);
        await route.fulfill({ response });
      });

      await page.route('**/_next/static/**/*.js', async route => {
        await new Promise(resolve => setTimeout(resolve, 300));
        await route.continue();
      });

      await u.page.goToRelative('/clerk-status');

      await expect(page.getByText('Status: ready')).toBeVisible({ timeout: 30_000 });
      await u.po.clerk.toBeLoaded();

      const sharedModulesError = errors.find(e => e.includes('__clerkSharedModules'));
      expect(sharedModulesError).toBeUndefined();
    });
  },
);
