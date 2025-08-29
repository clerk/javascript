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
    async function waitForAttribute(selector: string, attribute: string, value: string, timeout = 5000) {
      return page
        .waitForFunction(
          ({ sel, attr, val }) => {
            const element = document.querySelector(sel);
            return element?.getAttribute(attr) === val;
          },
          { sel: selector, attr: attribute, val: value },
          { timeout },
        )
        .then(() => {
          return true;
        })
        .catch(() => {
          return false;
        });
    }

    const isAnnually = await waitForAttribute(
      `.cl-pricingTableCard__${planSlug} .cl-switchIndicator`,
      'data-checked',
      'true',
      500,
    );

    if (isAnnually && period === 'monthly') {
      await locators.toggle(planSlug).click();
    }

    if (!isAnnually && period === 'annually') {
      await locators.toggle(planSlug).click();
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
    waitToBeFreeTrial: async ({ planSlug }: { planSlug: string }) => {
      return locators.badge(planSlug).getByText('Free trial').waitFor({ state: 'visible' });
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
        shouldSwitch === true
          ? 'Switch to this plan'
          : shouldSwitch === false
            ? /subscribe/i
            : /get|switch|subscribe|Start \d+-day free trial/i;

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
