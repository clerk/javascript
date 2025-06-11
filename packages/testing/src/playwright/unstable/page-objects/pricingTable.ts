import type { EnhancedPage } from './app';
import { common } from './common';

type BillingPeriod = 'monthly' | 'annually';

export const createPricingTablePageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;

  const locators = {
    toggle: (planSlug: string) => page.locator(`.cl-pricingTableCard__${planSlug} .cl-pricingTableCardPeriodToggle`),
    indicator: (planSlug: string) => page.locator(`.cl-pricingTableCard__${planSlug} .cl-switchIndicator`),
    badge: (planSlug: string) => page.locator(`.cl-pricingTableCard__${planSlug} .cl-badge`),
    footer: (planSlug: string) => page.locator(`.cl-pricingTableCard__${planSlug} .cl-pricingTableCardFooter`),
  };

  const ensurePricingPeriod = async (planSlug: string, period: BillingPeriod): Promise<void> => {
    const maxAttempts = 3;
    let attempts = 0;

    async function isToggleStateMatchingPeriod(period: BillingPeriod): Promise<boolean> {
      const isChecked = (await locators.indicator(planSlug).getAttribute('data-checked')) === 'true';
      return (isChecked && period === 'monthly') || (!isChecked && period === 'annually');
    }

    while (!(await isToggleStateMatchingPeriod(period)) && attempts < maxAttempts) {
      await locators.toggle(planSlug).click();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error(`Failed to set pricing period to ${period} after ${maxAttempts} attempts`);
    }
  };

  const self = {
    ...common(testArgs),
    waitForMounted: (selector = '.cl-pricingTable-root') => {
      return page.waitForSelector(selector, { state: 'attached' });
    },
    clickResubscribe: async () => {
      await page.getByText('Re-subscribe').click();
    },
    waitToBeActive: async ({ planSlug }: { planSlug: string }) => {
      return locators.badge(planSlug).getByText('Active').waitFor({ state: 'visible' });
    },
    getPlanCardCTA: ({ planSlug }: { planSlug: string }) => {
      return locators.footer(planSlug).getByRole('button', {
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
      period?: BillingPeriod;
    }) => {
      const targetButtonName =
        shouldSwitch === true ? 'Switch to this plan' : shouldSwitch === false ? /subscribe/i : /get|switch|subscribe/i;

      if (period) {
        await ensurePricingPeriod(planSlug, period);
      }

      await locators
        .footer(planSlug)
        .getByRole('button', {
          name: targetButtonName,
        })
        .click();
    },
  };
  return self;
};
