import type {
  BillingCheckoutDiscounts,
  BillingCheckoutDiscountsJSON,
  BillingCheckoutTotals,
  BillingCheckoutTotalsJSON,
  BillingCredits,
  BillingCreditsJSON,
  BillingMoneyAmount,
  BillingMoneyAmountJSON,
  BillingPaymentTotals,
  BillingPaymentTotalsJSON,
  BillingPerPeriodTotals,
  BillingPerPeriodTotalsJSON,
  BillingPerUnitTotal,
  BillingPerUnitTotalJSON,
  BillingPlanUnitPriceJSON,
  BillingStatementTotals,
  BillingStatementTotalsJSON,
  BillingSubscriptionItemNextPayment,
  BillingSubscriptionItemNextPaymentJSON,
  BillingSubscriptionNextPayment,
  BillingSubscriptionNextPaymentJSON,
} from '@clerk/shared/types';

import { unixEpochToDate } from './date';

export const billingMoneyAmountFromJSON = (data: BillingMoneyAmountJSON): BillingMoneyAmount => {
  return {
    amount: data.amount,
    amountFormatted: data.amount_formatted,
    currency: data.currency,
    currencySymbol: data.currency_symbol,
  };
};

const billingPerUnitTotalsFromJSON = (data: BillingPerUnitTotalJSON[]): BillingPerUnitTotal[] => {
  return data.map(unitTotal => ({
    name: unitTotal.name,
    blockSize: unitTotal.block_size,
    tiers: unitTotal.tiers.map(tier => ({
      quantity: tier.quantity,
      feePerBlock: billingMoneyAmountFromJSON(tier.fee_per_block),
      total: billingMoneyAmountFromJSON(tier.total),
    })),
  }));
};

const billingNextPaymentFromJSON = (
  data: BillingSubscriptionNextPaymentJSON | BillingSubscriptionItemNextPaymentJSON,
) => {
  return {
    amount: billingMoneyAmountFromJSON(data.amount),
    date: unixEpochToDate(data.date),
    perUnitTotals: data.per_unit_totals ? billingPerUnitTotalsFromJSON(data.per_unit_totals) : undefined,
  };
};

export const billingSubscriptionNextPaymentFromJSON = (
  data: BillingSubscriptionNextPaymentJSON,
): BillingSubscriptionNextPayment => billingNextPaymentFromJSON(data);

export const billingSubscriptionItemNextPaymentFromJSON = (
  data: BillingSubscriptionItemNextPaymentJSON,
): BillingSubscriptionItemNextPayment => billingNextPaymentFromJSON(data);

export const billingUnitPriceFromJSON = (unitPrice: BillingPlanUnitPriceJSON) => ({
  name: unitPrice.name,
  blockSize: unitPrice.block_size,
  tiers: unitPrice.tiers.map(tier => ({
    id: tier.id,
    startsAtBlock: tier.starts_at_block,
    endsAfterBlock: tier.ends_after_block,
    feePerBlock: billingMoneyAmountFromJSON(tier.fee_per_block),
  })),
});

export const billingPaymentTotalsFromJSON = (data: BillingPaymentTotalsJSON): BillingPaymentTotals => {
  return {
    subtotal: billingMoneyAmountFromJSON(data.subtotal),
    grandTotal: billingMoneyAmountFromJSON(data.grand_total),
    taxTotal: billingMoneyAmountFromJSON(data.tax_total),
    baseFee: data.base_fee ? billingMoneyAmountFromJSON(data.base_fee) : null,
    perUnitTotals: data.per_unit_totals ? billingPerUnitTotalsFromJSON(data.per_unit_totals) : undefined,
  };
};

export const billingCreditsFromJSON = (data: BillingCreditsJSON): BillingCredits => {
  return {
    proration: data.proration
      ? {
          amount: billingMoneyAmountFromJSON(data.proration.amount),
          cycleDaysRemaining: data.proration.cycle_days_remaining,
          cycleDaysTotal: data.proration.cycle_days_total,
          cycleRemainingPercent: data.proration.cycle_remaining_percent,
        }
      : null,
    payer: data.payer
      ? {
          remainingBalance: billingMoneyAmountFromJSON(data.payer.remaining_balance),
          appliedAmount: billingMoneyAmountFromJSON(data.payer.applied_amount),
        }
      : null,
    total: billingMoneyAmountFromJSON(data.total),
  };
};

const billingCheckoutDiscountsFromJSON = (data: BillingCheckoutDiscountsJSON): BillingCheckoutDiscounts => {
  return {
    proration: data.proration
      ? {
          amount: billingMoneyAmountFromJSON(data.proration.amount),
          cycleDaysPassed: data.proration.cycle_days_passed,
          cycleDaysTotal: data.proration.cycle_days_total,
          cyclePassedPercent: data.proration.cycle_passed_percent,
        }
      : null,
    total: billingMoneyAmountFromJSON(data.total),
  };
};

const billingPerPeriodTotalsFromJSON = (data: BillingPerPeriodTotalsJSON): BillingPerPeriodTotals => {
  return {
    subtotal: billingMoneyAmountFromJSON(data.subtotal),
    baseFee: billingMoneyAmountFromJSON(data.base_fee),
    taxTotal: billingMoneyAmountFromJSON(data.tax_total),
    grandTotal: billingMoneyAmountFromJSON(data.grand_total),
    perUnitTotals: data.per_unit_totals ? billingPerUnitTotalsFromJSON(data.per_unit_totals) : undefined,
  };
};

export const billingTotalsFromJSON = <T extends BillingStatementTotalsJSON | BillingCheckoutTotalsJSON>(
  data: T,
): T extends { total_due_now: BillingMoneyAmountJSON } ? BillingCheckoutTotals : BillingStatementTotals => {
  const totals: Partial<BillingCheckoutTotals & BillingStatementTotals> = {
    grandTotal: billingMoneyAmountFromJSON(data.grand_total),
    subtotal: billingMoneyAmountFromJSON(data.subtotal),
    taxTotal: billingMoneyAmountFromJSON(data.tax_total),
  };

  if ('base_fee' in data && data.base_fee) {
    totals.baseFee = billingMoneyAmountFromJSON(data.base_fee);
  }
  if ('past_due' in data) {
    totals.pastDue = data.past_due ? billingMoneyAmountFromJSON(data.past_due) : null;
  }
  if ('credit' in data) {
    totals.credit = data.credit ? billingMoneyAmountFromJSON(data.credit) : null;
  }
  if ('per_unit_totals' in data) {
    totals.perUnitTotals = data.per_unit_totals ? billingPerUnitTotalsFromJSON(data.per_unit_totals) : undefined;
  }

  if ('credits' in data) {
    totals.credits = data.credits ? billingCreditsFromJSON(data.credits) : null;
  }
  if ('total_due_now' in data) {
    totals.totalDueNow = billingMoneyAmountFromJSON(data.total_due_now);
  }

  if ('total_due_after_free_trial' in data) {
    totals.totalDueAfterFreeTrial = data.total_due_after_free_trial
      ? billingMoneyAmountFromJSON(data.total_due_after_free_trial)
      : null;
  }

  if ('discounts' in data) {
    totals.discounts = data.discounts ? billingCheckoutDiscountsFromJSON(data.discounts) : null;
  }

  if ('total_due_per_period' in data && data.total_due_per_period) {
    totals.totalDuePerPeriod = billingMoneyAmountFromJSON(data.total_due_per_period);
  }

  if ('totals_due_per_period' in data && data.totals_due_per_period) {
    totals.totalsDuePerPeriod = billingPerPeriodTotalsFromJSON(data.totals_due_per_period);
  }

  return totals as T extends { total_due_now: BillingMoneyAmountJSON } ? BillingCheckoutTotals : BillingStatementTotals;
};
