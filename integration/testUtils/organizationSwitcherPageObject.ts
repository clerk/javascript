import { expect } from '@playwright/test';

import { common } from './commonPageObject';
import type { TestArgs } from './signInPageObject';

export const createOrganizationSwitcherComponentPageObject = (testArgs: TestArgs) => {
  const { page } = testArgs;

  const self = {
    ...common(testArgs),
    goTo: async (relativePath = '/switcher') => {
      await page.goToRelative(relativePath);
      return self.waitForMounted();
    },
    waitForMounted: () => {
      return page.waitForSelector('.cl-organizationSwitcher-root', { state: 'attached' });
    },
    expectNoOrganizationSelected: () => {
      return expect(page.getByText(/No organization selected/i)).toBeVisible();
    },
    expectPersonalAccount: () => {
      return expect(page.getByText(/personal account/i)).toBeVisible();
    },
    toggleTrigger: () => {
      return page.locator('.cl-organizationSwitcherTrigger').click();
    },
    waitForAnOrganizationToSelected: () => {
      return page.waitForSelector('.cl-userPreviewMainIdentifier__personalWorkspace', { state: 'detached' });
    },
  };

  return self;
};
