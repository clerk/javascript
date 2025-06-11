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

    async function waitForAttribute(selector: string, attribute: string, value: string, timeout = 5000): Promise<void> {
      await page.waitForFunction(
        ({ sel, attr, val }) => {
          const element = document.querySelector(sel);
          return element?.getAttribute(attr) === val;
        },
        { sel: selector, attr: attribute, val: value },
        { timeout },
      );
    }

    async function isToggleStateMatchingPeriod(period: BillingPeriod): Promise<boolean> {
      await locators.indicator(planSlug).waitFor({ state: 'visible' });
      const expectedValue = period === 'annually' ? 'true' : 'false';
      let isMatching = false;
      await waitForAttribute(
        `.cl-pricingTableCard__${planSlug} .cl-switchIndicator`,
        'data-checked',
        expectedValue,
        500,
      )
        .then(() => {
          isMatching = true;
        })
        .catch(() => {
          isMatching = false;
        });

      return isMatching;
    }

    while (!(await isToggleStateMatchingPeriod(period)) && attempts < maxAttempts) {
      await locators.toggle(planSlug).waitFor({ state: 'visible' });
      await locators.toggle(planSlug).click();
      attempts++;
    }

    // Final verification that we're in the correct state
    const finalState = await isToggleStateMatchingPeriod(period);
    if (!finalState) {
      throw new Error(`Pricing period toggle ended in incorrect state for ${period}`);
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
