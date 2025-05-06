import type { EnhancedPage } from './app';
import { common } from './common';

export const createPricingTablePageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;
  const self = {
    ...common(testArgs),
    waitForMounted: (selector = '.cl-pricingTable-root') => {
      return page.waitForSelector(selector, { state: 'attached' });
    },
    // clickManageSubscription: async () => {
    //   await page.getByText('Manage subscription').click();
    // },
    clickResubscribe: async () => {
      await page.getByText('Re-subscribe').click();
    },
    startCheckout: async ({ planSlug, shouldSwitch }: { planSlug: string; shouldSwitch?: boolean }) => {
      const targetButtonName =
        shouldSwitch === true ? 'Switch to this plan' : shouldSwitch === false ? /subscribe/i : /get|switch|subscribe/i;

      await page
        .locator(`.cl-pricingTableCard__${planSlug} .cl-pricingTableCardFooter`)
        .getByRole('button', {
          name: targetButtonName,
        })
        .click();
    },
  };
  return self;
};
