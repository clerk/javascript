import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const rootElement = '.cl-userButton-root';
const triggerElement = '.cl-userButtonTrigger';
const popoverElement = '.cl-userButtonPopoverCard';

test('user button', async ({ page }) => {
  await page.goto('/sign-in');
  await clerk.loaded({ page });
  await clerk.signIn({
    page,
    signInParams: { strategy: 'email_code', identifier: 'sandbox+clerk_test@clerk.dev' },
  });
  await page.goto('/user-button');
  await page.waitForSelector(rootElement, { state: 'attached' });
  await page.locator(triggerElement).click();
  await page.waitForSelector(popoverElement, { state: 'visible' });
  await expect(page.locator(popoverElement)).toHaveScreenshot('user-button-popover.png');
});
