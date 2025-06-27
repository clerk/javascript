import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const rootElement = '.cl-modalBackdrop';
const buttonElement = 'button:has-text("Open Sign In")';

test('sign in modal', async ({ page }) => {
  await page.goto('/open-sign-in');
  await clerk.loaded({ page });
  await page.locator(buttonElement).click();
  await page.waitForSelector(rootElement, { state: 'visible' });
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in-modal.png');
});
