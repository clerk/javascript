import type { Browser, BrowserContext } from '@playwright/test';

import type { createAppPageObject } from './appPageObject';
import { common } from './commonPageObject';

export type EnchancedPage = ReturnType<typeof createAppPageObject>;
export type TestArgs = { page: EnchancedPage; context: BrowserContext; browser: Browser };

export const createUserVerificationComponentPageObject = (testArgs: TestArgs) => {
  const { page } = testArgs;
  const self = {
    ...common(testArgs),
    waitForMounted: (selector = '.cl-userVerification-root') => {
      return page.waitForSelector(selector, { state: 'attached' });
    },
    getUseAnotherMethodLink: () => {
      return page.getByRole('link', { name: /use another method/i });
    },
    getAltMethodsEmailCodeButton: () => {
      return page.getByRole('button', { name: /email code to/i });
    },
    getAltMethodsEmailLinkButton: () => {
      return page.getByRole('button', { name: /email link to/i });
    },
  };
  return self;
};
