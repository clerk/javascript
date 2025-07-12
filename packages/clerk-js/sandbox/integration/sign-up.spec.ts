import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const rootElement = '.cl-signUp-root';

test('sign up', async ({ page }) => {
  await page.goto('/sign-up');
  await clerk.loaded({ page });
  await page.waitForSelector(rootElement, { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-up.png');
});
