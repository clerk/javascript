import type { BillingPlanResource, BillingSubscriptionPlanPeriod } from '@clerk/shared/types';

import { localizationKeys, useLocalizations } from '../../customizables';
import type { PricingTableCardHeaderData } from './pricing-table-card.types';

export const usePricingTableCardHeaderModel = (
  plan: BillingPlanResource | undefined,
  planPeriod: BillingSubscriptionPlanPeriod,
): PricingTableCardHeaderData | null => {
  const { $ } = useLocalizations();
  if (!plan) {
    return null;
  }
  const fee = !plan.annualMonthlyFee
    ? plan.fee
    : !plan.fee
      ? plan.annualFee
      : planPeriod === 'annual'
        ? plan.annualMonthlyFee
        : plan.fee;
  const unitPrice = plan.unitPrices?.length === 1 ? plan.unitPrices[0] : null;
  const singleUnitPriceTierFee =
    !plan.hasBaseFee && unitPrice?.tiers.length === 1 ? unitPrice.tiers[0].feePerBlock : null;
  const feePeriodText =
    !plan.hasBaseFee && plan.unitPrices && plan.unitPrices.length > 0
      ? localizationKeys('billing.monthPerUnit', { unitName: plan.unitPrices[0].name })
      : plan.fee
        ? localizationKeys('billing.month')
        : localizationKeys('billing.year');
  const displayedFee = singleUnitPriceTierFee ?? fee;

  return {
    name: plan.name,
    description: plan.description,
    isDefault: plan.isDefault,
    hasMonthlyFee: !!plan.fee,
    hasAnnualMonthlyFee: !!plan.annualMonthlyFee,
    feePeriodText,
    feeFormatted: displayedFee ? $(displayedFee, { style: 'short' }) : '',
  };
};
