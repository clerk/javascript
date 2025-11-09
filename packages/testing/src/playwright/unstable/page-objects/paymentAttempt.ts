import type { EnhancedPage } from './app';
import { common } from './common';

export const createPaymentAttemptPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;
  const root = page.locator('.cl-paymentAttemptRoot');
  const self = {
    ...common(testArgs),
    waitForMounted: () => {
      return root.waitFor({ state: 'visible', timeout: 15000 });
    },
    waitForUnmounted: () => {
      return root.waitFor({ state: 'detached', timeout: 15000 });
    },
    goBackToPaymentsList: async () => {
      await Promise.all([
        page.waitForURL(/tab=payments/, { timeout: 15000 }),
        page.getByRole('link', { name: /Payments/i }).click(),
      ]);
      await root.waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
    },
    getStatusBadge: () => {
      return self.root.locator('.cl-paymentAttemptHeaderBadge');
    },
    getTotalAmount: () => {
      return self.root.locator('.cl-paymentAttemptFooterValue');
    },
    getLineItemTitles: () => {
      return self.root.locator('.cl-lineItemsTitle');
    },
    root,
  };

  return self;
};
