import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const rootElement = '.cl-signIn-root';
const buttonElement = '.cl-formButtonPrimary';

test('sign in', async ({ page }) => {
  await page.goto('/sign-in');
  await clerk.loaded({ page });
  await page.waitForSelector(rootElement, { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in.png');
  await page.locator(buttonElement).hover();
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in-button-hover.png');
});
