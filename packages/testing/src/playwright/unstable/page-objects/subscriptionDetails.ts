import type { EnhancedPage } from './app';
import { common } from './common';

export const createSubscriptionDetailsPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;
  const self = {
    ...common(testArgs),
    waitForMounted: (selector = '.cl-subscriptionDetails-root') => {
      return page.waitForSelector(selector, { state: 'attached' });
    },
    waitForUnmounted: () => {
      return self.root.locator('.cl-drawerRoot').waitFor({ state: 'detached' });
    },
    closeDrawer: () => {
      return self.root.locator('.cl-drawerClose').click();
    },
    root: page.locator('.cl-subscriptionDetails-root'),
  };
  return self;
};
