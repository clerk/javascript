import { expect, test } from '@playwright/test';

import { signInWithEmailCode } from './helpers';

const rootElement = '.cl-createOrganization-root';

test('create organization', async ({ page }) => {
  await signInWithEmailCode(page);
  await page.goto('/create-organization');
  await page.waitForSelector(rootElement, { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('create-organization.png');
});
