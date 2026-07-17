import type {
  BillingCredits,
  BillingCreditsJSON,
  BillingDiscounts,
  BillingDiscountsJSON,
  BillingMoneyAmount,
  BillingMoneyAmountJSON,
  BillingPeriodTotals,
  BillingPeriodTotalsJSON,
  BillingPerUnitTotal,
  BillingPerUnitTotalJSON,
  BillingSubscriptionItemSeats,
  BillingSubscriptionItemSeatsJSON,
  BillingTotals,
  BillingTotalsJSON,
} from '@clerk/shared/types';

export const billingMoneyAmountFromJSON = (amount: BillingMoneyAmountJSON): BillingMoneyAmount => ({
  amount: amount.amount,
  amountFormatted: amount.amount_formatted,
  currency: amount.currency,
  currencySymbol: amount.currency_symbol,
});

export const billingPerUnitTotalsFromJSON = (perUnitTotals: BillingPerUnitTotalJSON[]): BillingPerUnitTotal[] =>
  perUnitTotals.map(perUnitTotal => ({
    name: perUnitTotal.name,
    blockSize: perUnitTotal.block_size,
    tiers: perUnitTotal.tiers.map(tier => ({
      quantity: tier.quantity,
      feePerBlock: billingMoneyAmountFromJSON(tier.fee_per_block),
      total: billingMoneyAmountFromJSON(tier.total),
    })),
  }));

const billingCreditsFromJSON = (credits: BillingCreditsJSON): BillingCredits => ({
  proration: credits.proration
    ? {
        amount: billingMoneyAmountFromJSON(credits.proration.amount),
        cycleDaysRemaining: credits.proration.cycle_days_remaining,
        cycleDaysTotal: credits.proration.cycle_days_total,
        cycleRemainingPercent: credits.proration.cycle_remaining_percent,
      }
    : null,
  payer: credits.payer
    ? {
        remainingBalance: billingMoneyAmountFromJSON(credits.payer.remaining_balance),
        appliedAmount: billingMoneyAmountFromJSON(credits.payer.applied_amount),
      }
    : null,
  total: billingMoneyAmountFromJSON(credits.total),
});

const billingDiscountsFromJSON = (discounts: BillingDiscountsJSON): BillingDiscounts => ({
  proration: discounts.proration
    ? {
        amount: billingMoneyAmountFromJSON(discounts.proration.amount),
        cycleDaysPassed: discounts.proration.cycle_days_passed,
        cycleDaysTotal: discounts.proration.cycle_days_total,
        cyclePassedPercent: discounts.proration.cycle_passed_percent,
      }
    : null,
  total: billingMoneyAmountFromJSON(discounts.total),
});

const billingPeriodTotalsFromJSON = (totals: BillingPeriodTotalsJSON): BillingPeriodTotals => ({
  subtotal: billingMoneyAmountFromJSON(totals.subtotal),
  baseFee: billingMoneyAmountFromJSON(totals.base_fee),
  taxTotal: billingMoneyAmountFromJSON(totals.tax_total),
  grandTotal: billingMoneyAmountFromJSON(totals.grand_total),
  perUnitTotals: totals.per_unit_totals ? billingPerUnitTotalsFromJSON(totals.per_unit_totals) : undefined,
});

export const billingTotalsFromJSON = (totals: BillingTotalsJSON): BillingTotals => ({
  subtotal: billingMoneyAmountFromJSON(totals.subtotal),
  baseFee: totals.base_fee ? billingMoneyAmountFromJSON(totals.base_fee) : null,
  taxTotal: billingMoneyAmountFromJSON(totals.tax_total),
  grandTotal: billingMoneyAmountFromJSON(totals.grand_total),
  totalDueAfterFreeTrial: totals.total_due_after_free_trial
    ? billingMoneyAmountFromJSON(totals.total_due_after_free_trial)
    : totals.total_due_after_free_trial,
  credit: totals.credit ? billingMoneyAmountFromJSON(totals.credit) : totals.credit,
  credits: totals.credits ? billingCreditsFromJSON(totals.credits) : null,
  discounts: totals.discounts ? billingDiscountsFromJSON(totals.discounts) : null,
  pastDue: totals.past_due ? billingMoneyAmountFromJSON(totals.past_due) : totals.past_due,
  totalDueNow: totals.total_due_now ? billingMoneyAmountFromJSON(totals.total_due_now) : undefined,
  perUnitTotals: totals.per_unit_totals ? billingPerUnitTotalsFromJSON(totals.per_unit_totals) : undefined,
  totalsDuePerPeriod: totals.totals_due_per_period
    ? billingPeriodTotalsFromJSON(totals.totals_due_per_period)
    : undefined,
  totalDuePerPeriod: totals.total_due_per_period ? billingMoneyAmountFromJSON(totals.total_due_per_period) : undefined,
});

export const billingSubscriptionItemSeatsFromJSON = (
  seats: BillingSubscriptionItemSeatsJSON,
): BillingSubscriptionItemSeats => ({
  quantity: seats.quantity,
  tiers: seats.tiers
    ? seats.tiers.map(tier => ({
        quantity: tier.quantity,
        feePerBlock: billingMoneyAmountFromJSON(tier.fee_per_block),
        total: billingMoneyAmountFromJSON(tier.total),
      }))
    : undefined,
});
