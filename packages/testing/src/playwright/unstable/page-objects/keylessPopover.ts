import type { EnhancedPage } from './app';

export const createKeylessPopoverPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;
  const button = page.getByRole('button', { name: 'Keyless prompt' });
  const self = {
    waitForMounted: () => button.waitFor({ state: 'attached' }),
    waitForUnmounted: () => button.waitFor({ state: 'detached' }),
    isExpanded: () => button.getAttribute('aria-expanded').then(val => val === 'true'),
    toggle: () => button.click(),

    promptsToClaim: () => {
      return page.getByRole('link', { name: /^configure your application$/i });
    },
    promptToUseClaimedKeys: () => {
      return page.getByRole('link', { name: /^get api keys$/i });
    },
    promptToDismiss: () => {
      return page.getByRole('button', { name: /^dismiss$/i });
    },
  };
  return self;
};
