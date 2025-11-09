import type { EnhancedPage } from './app';
import { common } from './common';

export const createStatementPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;
  const root = page.locator('.cl-statementRoot');
  const self = {
    ...common(testArgs),
    waitForMounted: () => {
      return root.waitFor({ state: 'visible', timeout: 15000 });
    },
    waitForUnmounted: () => {
      return root.waitFor({ state: 'detached', timeout: 15000 });
    },
    goBackToStatementsList: async () => {
      await Promise.all([
        page.waitForURL(/tab=statements/, { timeout: 15000 }),
        page.getByRole('link', { name: /Statements/i }).click(),
      ]);
      await root.waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
    },
    clickViewPaymentButton: async () => {
      await self.root
        .getByRole('button', { name: /View payment/i })
        .first()
        .click();
    },
    getPlanLineItems: () => {
      return self.root.locator('.cl-statementSectionContentDetailsHeaderTitle');
    },
    getTotalPaidValue: () => {
      return self.root.locator('.cl-statementFooterValue');
    },
    root,
  };

  return self;
};
