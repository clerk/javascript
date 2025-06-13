import type { EnhancedPage } from './app';
import { common } from './common';

export const createAPIKeysPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;

  const self = {
    ...common(testArgs),
    waitForMounted: (selector = '.cl-apiKeys-root') => {
      return page.waitForSelector(selector, { state: 'attached' });
    },
  };

  return self;
};
