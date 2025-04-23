import type { Browser, BrowserContext } from '@playwright/test';

import type { createAppPageObject } from './appPageObject';

export type EnchancedPage = ReturnType<typeof createAppPageObject>;
export type TestArgs = { page: EnchancedPage; context: BrowserContext; browser: Browser };

export const createImpersonationPageObject = (testArgs: TestArgs) => {
  const { page } = testArgs;
  const self = {
    waitForMounted: (selector = '.cl-impersonationFab') => {
      return page.waitForSelector(selector, { state: 'attached' });
    },
    getSignOutLink: () => {
      return page.locator('.cl-impersonationFab').getByText('Sign out');
    },
  };
  return self;
};
