import { expect, test } from '@playwright/test';

import { signInWithEmailCode } from './helpers';

const rootElement = '.cl-organizationSwitcher-root';
const triggerElement = '.cl-organizationSwitcherTrigger';
const popoverElement = '.cl-organizationSwitcherPopoverCard';
const actionElement = '.cl-organizationSwitcherPopoverActionButton__createOrganization';

test('organization switcher', async ({ page }) => {
  await signInWithEmailCode(page);
  await page.goto('/organization-switcher');
  await page.waitForSelector(rootElement, { state: 'attached' });
  await page.locator(triggerElement).click();
  await page.waitForSelector(popoverElement, { state: 'visible' });
  await expect(page.locator(popoverElement)).toHaveScreenshot('organization-switcher-popover.png');
  await page.locator(actionElement).hover();
  await expect(page.locator(popoverElement)).toHaveScreenshot('organization-switcher-action-hover.png');
});
