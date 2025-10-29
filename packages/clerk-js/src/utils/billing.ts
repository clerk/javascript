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

  if ('total_due_now' in data && data.total_due_now) {
    totals.totalDueNow = billingMoneyAmountFromJSON(data.total_due_now);
  }
  if ('credit' in data && data.credit) {
    totals.credit = billingMoneyAmountFromJSON(data.credit);
  }
  if ('past_due' in data && data.past_due) {
    totals.pastDue = billingMoneyAmountFromJSON(data.past_due);
  }

  // WHY `total_due_after_free_trial` and why `proration`

  return totals as T extends { total_due_now: BillingMoneyAmountJSON } ? BillingCheckoutTotals : BillingStatementTotals;
};
