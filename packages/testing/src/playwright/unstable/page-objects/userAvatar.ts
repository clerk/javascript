import { expect } from '@playwright/test';

import type { EnhancedPage } from './app';

const SELECTOR = '.cl-userAvatarBox';

export const createUserAvatarPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;

  const self = {
    goTo: async (opts?: { searchParams: URLSearchParams }) => {
      await page.goToRelative('/user-avatar', opts);
      return self.waitForMounted();
    },
    waitForMounted: (selector = SELECTOR) => {
      return page.waitForSelector(selector, { state: 'attached' });
    },
    toBeVisible: async (selector = SELECTOR) => {
      return await expect(page.locator(selector).getByRole('img')).toBeVisible();
    },
  };

  return self;
};
