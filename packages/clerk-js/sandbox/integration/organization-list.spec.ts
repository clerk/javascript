import { expect, test } from '@playwright/test';

import { signInWithEmailCode } from './helpers';

const rootElement = '.cl-organizationList-root';

test('organization list', async ({ page }) => {
  await signInWithEmailCode(page);
  await page.goto('/organization-list');
  await page.waitForSelector(rootElement, { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('organization-list.png');
});
