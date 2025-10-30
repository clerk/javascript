import type {
  BillingCheckoutTotals,
  BillingCheckoutTotalsJSON,
  BillingMoneyAmount,
  BillingMoneyAmountJSON,
  BillingStatementTotals,
  BillingStatementTotalsJSON,
} from '@clerk/types';

export const billingMoneyAmountFromJSON = (data: BillingMoneyAmountJSON): BillingMoneyAmount => {
  return {
    amount: data.amount,
    amountFormatted: data.amount_formatted,
    currency: data.currency,
    currencySymbol: data.currency_symbol,
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

  if ('total_due_now' in data) {
    totals.totalDueNow = data.total_due_now ? billingMoneyAmountFromJSON(data.total_due_now) : null;
  }
  if ('credit' in data) {
    totals.credit = data.credit ? billingMoneyAmountFromJSON(data.credit) : null;
  }
  if ('past_due' in data) {
    totals.pastDue = data.past_due ? billingMoneyAmountFromJSON(data.past_due) : null;
  }
  if ('total_due_after_free_trial' in data) {
    totals.totalDueAfterFreeTrial = data.total_due_after_free_trial
      ? billingMoneyAmountFromJSON(data.total_due_after_free_trial)
      : null;
  }
  if ('proration' in data) {
    if (data.proration) {
      totals.proration = {
        credit: data.proration.credit ? billingMoneyAmountFromJSON(data.proration.credit) : null,
      };
    } else {
      totals.proration = null;
    }
  }

  // WHY `total_due_after_free_trial` and why `proration`

  return totals as T extends { total_due_now: BillingMoneyAmountJSON } ? BillingCheckoutTotals : BillingStatementTotals;
};
