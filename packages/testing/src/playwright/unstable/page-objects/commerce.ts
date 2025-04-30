import type { EnhancedPage } from './app';
import { common } from './common';

export const createCommerceComponentPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;

  const self = {
    ...common(testArgs),
    goToPricingTable: async (opts?: { searchParams?: URLSearchParams; headlessSelector?: string }) => {
      await page.goToRelative('/pricing-table', { searchParams: opts?.searchParams });
      return await page.waitForURL(/pricing-table/);
    },
  };

  return self;
};
