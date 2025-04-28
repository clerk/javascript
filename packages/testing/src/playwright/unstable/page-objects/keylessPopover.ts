import type { EnhancedPage } from './app';

export const createKeylessPopoverPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;
  // TODO: Is this the ID we really want ?
  const elementId = '#--clerk-keyless-prompt-button';
  const self = {
    waitForMounted: () => page.waitForSelector(elementId, { state: 'attached' }),
    waitForUnmounted: () => page.waitForSelector(elementId, { state: 'detached' }),
    isExpanded: () =>
      page
        .locator(elementId)
        .getAttribute('aria-expanded')
        .then(val => val === 'true'),
    toggle: () => page.locator(elementId).click(),

    promptsToClaim: () => {
      return page.getByRole('link', { name: /^claim application$/i });
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
