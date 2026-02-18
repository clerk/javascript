import type {
  BillingCheckoutTotals,
  BillingCheckoutTotalsJSON,
  BillingCredits,
  BillingCreditsJSON,
  BillingMoneyAmount,
  BillingMoneyAmountJSON,
  BillingPerUnitTotal,
  BillingPerUnitTotalJSON,
  BillingStatementTotals,
  BillingStatementTotalsJSON,
} from '@clerk/shared/types';

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

const billingCreditsFromJSON = (data: BillingCreditsJSON): BillingCredits => {
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

export const billingTotalsFromJSON = <T extends BillingStatementTotalsJSON | BillingCheckoutTotalsJSON>(
  data: T,
): T extends { total_due_now: BillingMoneyAmountJSON } ? BillingCheckoutTotals : BillingStatementTotals => {
  const totals: Partial<BillingCheckoutTotals & BillingStatementTotals> = {
    grandTotal: billingMoneyAmountFromJSON(data.grand_total),
    subtotal: billingMoneyAmountFromJSON(data.subtotal),
    taxTotal: billingMoneyAmountFromJSON(data.tax_total),
  };

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

  return totals as T extends { total_due_now: BillingMoneyAmountJSON } ? BillingCheckoutTotals : BillingStatementTotals;
};
