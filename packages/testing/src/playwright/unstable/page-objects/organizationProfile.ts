import type { EnhancedPage } from './app';
import { common } from './common';

export const createOrganizationProfileComponentPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;
  const self = {
    ...common(testArgs),
    goTo: async (opts?: { searchParams: URLSearchParams }) => {
      await page.goToRelative('/organization-profile', opts);
      return self.waitForMounted();
    },
    switchToBillingTab: async () => {
      await page.getByRole('button', { name: /^Billing$/i }).click();
    },
    switchToMembersTab: async () => {
      await page.getByRole('button', { name: /^Members$/i }).click();
    },
    waitForMounted: () => {
      return page.waitForSelector('.cl-organizationProfile-root', { state: 'attached' });
    },
  };
  return self;
};
