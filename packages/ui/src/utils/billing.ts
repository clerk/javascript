import type { BillingMoneyAmount, BillingSubscriptionPlanPeriod } from '@clerk/shared/types/billing';

import type { useLocalizations } from '../localization';
import { localizationKeys } from '../localization';

type Discount = {
  effect?: 'percentage' | 'fixed_amount';
  percentOff?: number;
  amountOff?: BillingMoneyAmount;
};

type Localizations = Pick<ReturnType<typeof useLocalizations>, '$' | 't'>;

export function getDiscountDescription(
  discount: Discount,
  cycles: number | null,
  planPeriod: BillingSubscriptionPlanPeriod,
  { $, t }: Localizations,
) {
  const amount =
    discount.effect === 'percentage' && discount.percentOff !== undefined
      ? `${discount.percentOff}%`
      : discount.amountOff
        ? $(discount.amountOff)
        : '';

  if (cycles === null) {
    return t(localizationKeys('billing.discountAmount', { amount }));
  }

  const period = getBillingPeriodLabel(planPeriod, cycles, t);
  return t(localizationKeys('billing.discountDuration', { amount, cycles, period }));
}

export function getBillingPeriodLabel(
  planPeriod: BillingSubscriptionPlanPeriod,
  cycles: number,
  t: Localizations['t'],
) {
  return t(
    localizationKeys(
      planPeriod === 'annual'
        ? cycles === 1
          ? 'billing.year'
          : 'billing.years'
        : cycles === 1
          ? 'billing.month'
          : 'billing.months',
    ),
  ).toLocaleLowerCase();
}

/**
 * Given a BillingMoneyAmount, convert positive values to negative. If the amount is already negative, leave it alone.
 */
export function toNegativeAmount(amount: BillingMoneyAmount): BillingMoneyAmount {
  if (amount.amount < 0) {
    return amount;
  }

  return {
    ...amount,
    // convert positive amounts to negative
    amount: -amount.amount,
    // naively converts amountFormatted
    amountFormatted: `-${amount.amountFormatted}`,
  };
}
