import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';

import {
  getCheckoutSeatUnitTotal,
  getIncludedSeatsUnitTotalTier,
  getPaidSeatsUnitTotalTier,
  getSeatUnitPrice,
} from '@/ui/utils/billingPlanSeats';

import { localizationKeys, useLocalizations } from '../../customizables';
import { toNegativeAmount } from '../../utils/billing';
import type { CheckoutFormData } from './checkout.types';

export const useCheckoutFormModel = (): CheckoutFormData | null => {
  const { checkout } = useCheckout();
  const { $ } = useLocalizations();
  const { plan, totals, isImmediatePlanChange, planPeriod, freeTrialEndsAt } = checkout;

  if (!plan) {
    return null;
  }

  const showProratedCredit = !!totals.credits?.proration?.amount && totals.credits.proration.amount.amount > 0;
  const showAccountCredits = !!totals.credits?.payer?.appliedAmount && totals.credits.payer.appliedAmount.amount > 0;
  const showPastDue = !!totals.pastDue?.amount && totals.pastDue.amount > 0;
  const showProratedDiscount = !!totals.discounts?.proration?.amount && totals.discounts.proration.amount.amount > 0;
  const showRenewalTotals =
    !!totals.totalsDuePerPeriod &&
    totals.totalDueNow &&
    totals.totalsDuePerPeriod.grandTotal.amount !== totals.totalDueNow.amount;
  const showDowngradeInfo = !isImmediatePlanChange;

  const seatPerUnitTotal = getCheckoutSeatUnitTotal(totals);
  const includedSeatsTier = getIncludedSeatsUnitTotalTier(seatPerUnitTotal);
  const paidSeatsTier = getPaidSeatsUnitTotalTier(seatPerUnitTotal);

  const descriptionElements: CheckoutFormData['descriptionElements'] = [];
  if (planPeriod === 'annual') {
    descriptionElements.push(localizationKeys('billing.billedAnnually'));
  }
  if (includedSeatsTier && includedSeatsTier.quantity !== null) {
    descriptionElements.push(
      localizationKeys('billing.pricingTable.seatCost.includedSeats', {
        includedSeats: includedSeatsTier.quantity,
      }),
    );
  }
  const seatUnitPrice = getSeatUnitPrice(plan);
  if (seatUnitPrice && seatUnitPrice.tiers.length === 1 && seatUnitPrice.tiers[0].feePerBlock.amount === 0) {
    descriptionElements.push(
      seatUnitPrice.tiers[0].endsAfterBlock
        ? localizationKeys('billing.pricingTable.seatCost.upToSeats', {
            endsAfterBlock: seatUnitPrice.tiers[0].endsAfterBlock,
          })
        : localizationKeys('billing.pricingTable.seatCost.unlimitedSeats'),
    );
  }

  const trialTotal =
    freeTrialEndsAt && plan.freeTrialDays && totals.totalDueAfterFreeTrial
      ? { days: plan.freeTrialDays, amountText: $(totals.totalDueAfterFreeTrial) }
      : null;

  return {
    planName: plan.name,
    showFreeTrialBadge: Boolean(plan.freeTrialEnabled && freeTrialEndsAt),
    isAnnual: planPeriod === 'annual',
    baseFeeText: totals.baseFee ? $(totals.baseFee) : null,
    paidSeats:
      paidSeatsTier && paidSeatsTier.quantity !== null
        ? { quantity: paidSeatsTier.quantity, amountText: $(paidSeatsTier.feePerBlock) }
        : null,
    proratedDiscountText:
      showProratedDiscount && totals.discounts?.proration?.amount
        ? $(toNegativeAmount(totals.discounts.proration.amount))
        : null,
    proratedCreditText:
      showProratedCredit && totals.credits?.proration?.amount
        ? $(toNegativeAmount(totals.credits.proration.amount))
        : null,
    accountCreditsText:
      showAccountCredits && totals.credits?.payer?.appliedAmount
        ? $(toNegativeAmount(totals.credits.payer.appliedAmount))
        : null,
    pastDueText: showPastDue && totals.pastDue ? $(totals.pastDue) : null,
    trialTotal,
    periodTotalText: !trialTotal && !showRenewalTotals && totals.totalDuePerPeriod ? $(totals.totalDuePerPeriod) : null,
    totalDueNowText: totals.totalDueNow ? $(totals.totalDueNow) : null,
    renewalTotalText: showRenewalTotals && totals.totalsDuePerPeriod ? $(totals.totalsDuePerPeriod.grandTotal) : null,
    showDowngradeInfo,
    descriptionElements,
  };
};
