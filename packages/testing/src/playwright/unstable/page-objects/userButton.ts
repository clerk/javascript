import { expect } from '@playwright/test';

import type { EnhancedPage } from './app';

export const createUserButtonPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;

  const self = {
    waitForMounted: () => {
      return page.waitForSelector('.cl-userButtonTrigger', { state: 'attached' });
    },
    toggleTrigger: () => {
      return page.locator('.cl-userButtonTrigger').click();
    },
    waitForPopover: () => {
      return page.waitForSelector('.cl-userButtonPopoverCard', { state: 'visible' });
    },
    waitForPopoverClosed: () => {
      return page.waitForSelector('.cl-userButtonPopoverCard', { state: 'detached' });
    },
    toHaveVisibleMenuItems: async (menuItems: string | RegExp | Array<string | RegExp>) => {
      if (typeof menuItems === 'string' || menuItems instanceof RegExp) {
        menuItems = [menuItems];
      }
      for (const menuItem of menuItems) {
        await expect(page.getByRole('menuitem', { name: menuItem })).toBeVisible();
      }
    },
    triggerSignOut: () => {
      return page.getByRole('menuitem', { name: /Sign out$/i }).click();
    },
    triggerManageAccount: () => {
      return page.getByRole('menuitem', { name: /Manage account/i }).click();
    },
    switchAccount: (emailAddress: string) => {
      return page.getByText(emailAddress).click();
    },
  };

  return self;
};
