import type { Browser, BrowserContext } from '@playwright/test';

import type { createAppPageObject } from './appPageObject';

export type EnchancedPage = ReturnType<typeof createAppPageObject>;
export type TestArgs = { page: EnchancedPage; context: BrowserContext; browser: Browser };

export const createKeylessPopoverPageObject = (testArgs: TestArgs) => {
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
    claim: () => page.getByRole('link', { name: /Claim application/i }),
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
