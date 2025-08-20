import type { EnhancedPage } from './app';
import { common } from './common';

export const createPlanDetailsPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;
  const self = {
    ...common(testArgs),
    waitForMounted: (selector = '.cl-planDetails-root') => {
      return page.waitForSelector(selector, { state: 'attached' });
    },
    root: page.locator('.cl-planDetails-root'),
  };
  return self;
};
