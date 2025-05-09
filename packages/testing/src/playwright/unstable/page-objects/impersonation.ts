import type { EnhancedPage } from './app';

export const createImpersonationPageObject = (testArgs: { page: EnhancedPage }) => {
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
