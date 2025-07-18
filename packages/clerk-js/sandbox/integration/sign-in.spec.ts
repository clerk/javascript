import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const rootElement = '.cl-signIn-root';
const primaryButtonElement = '.cl-formButtonPrimary';
const secondaryButtonElement = '.cl-socialButtonsBlockButton__google';
const actionLinkElement = '.cl-footerActionLink';

test('sign in', async ({ page }) => {
  await page.goto('/sign-in');
  await clerk.loaded({ page });
  await page.waitForSelector(rootElement, { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in.png');
  await page.locator(primaryButtonElement).hover();
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in-primary-button-hover.png');
  await page.locator(secondaryButtonElement).hover();
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in-secondary-button-hover.png');
  await page.locator(actionLinkElement).hover();
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in-action-link-hover.png');
});
