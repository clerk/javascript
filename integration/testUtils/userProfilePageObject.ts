import type { Browser, BrowserContext } from '@playwright/test';

import type { createAppPageObject } from './appPageObject';

export type EnchancedPage = ReturnType<typeof createAppPageObject>;
export type TestArgs = { page: EnchancedPage; context: BrowserContext; browser: Browser };

export const createUserProfileComponentPageObject = (testArgs: TestArgs) => {
  const { page } = testArgs;
  const self = {
    goTo: async (opts?: { searchParams: URLSearchParams }) => {
      await page.goToRelative('/user', opts);
      return self.waitForMounted();
    },
    waitForMounted: () => {
      return page.waitForSelector('.cl-userProfile-root', { state: 'attached' });
    },
  };
  return self;
};
