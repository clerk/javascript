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
    waitToBeActive: async ({ planSlug }: { planSlug: string }) => {
      return page
        .locator(`.cl-pricingTableCard__${planSlug} .cl-badge`)
        .getByText('Active')
        .waitFor({ state: 'visible' });
    },
    getPlanCardCTA: ({ planSlug }: { planSlug: string }) => {
      return page.locator(`.cl-pricingTableCard__${planSlug} .cl-pricingTableCardFooter`).getByRole('button', {
        name: /get|switch|subscribe/i,
      });
    },
    startCheckout: async ({
      planSlug,
      shouldSwitch,
      period,
    }: {
      planSlug: string;
      shouldSwitch?: boolean;
      period?: 'monthly' | 'annually';
    }) => {
      const targetButtonName =
        shouldSwitch === true ? 'Switch to this plan' : shouldSwitch === false ? /subscribe/i : /get|switch|subscribe/i;

      if (period) {
        await page.locator(`.cl-pricingTableCard__${planSlug} .cl-pricingTableCardPeriodToggle`).click();

        const billedAnnuallyChecked = await page
          .locator(`.cl-pricingTableCard__${planSlug} .cl-switchIndicator`)
          .getAttribute('data-checked');

        if (billedAnnuallyChecked === 'true' && period === 'monthly') {
          await page.locator(`.cl-pricingTableCard__${planSlug} .cl-pricingTableCardPeriodToggle`).click();
        }
      }

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
