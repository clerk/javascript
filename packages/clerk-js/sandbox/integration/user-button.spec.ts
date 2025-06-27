import { expect, test } from '@playwright/test';

import { signInWithEmailCode } from './helpers';

const rootElement = '.cl-userButton-root';
const triggerElement = '.cl-userButtonTrigger';
const popoverElement = '.cl-userButtonPopoverCard';

test('user button', async ({ page }) => {
  await signInWithEmailCode(page);
  await page.goto('/user-button');
  await page.waitForSelector(rootElement, { state: 'attached' });
  await page.locator(triggerElement).click();
  await page.waitForSelector(popoverElement, { state: 'visible' });
  await expect(page.locator(popoverElement)).toHaveScreenshot('user-button-popover.png');
});
