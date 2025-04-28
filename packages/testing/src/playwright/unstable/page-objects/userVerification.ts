import type { EnhancedPage } from './app';
import { common } from './common';

export const createUserVerificationComponentPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;
  const self = {
    ...common(testArgs),
    waitForMounted: (selector = '.cl-userVerification-root') => {
      return page.waitForSelector(selector, { state: 'attached' });
    },
    waitForClosed: (selector = '.cl-userVerification-root') => {
      return page.waitForSelector(selector, { state: 'detached' });
    },
    closeReverificationModal: () => {
      return page.getByLabel('Close modal').click();
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
