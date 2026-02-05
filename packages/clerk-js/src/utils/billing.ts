import type {
  BillingCheckoutTotals,
  BillingCheckoutTotalsJSON,
  BillingMoneyAmount,
  BillingMoneyAmountJSON,
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
  if ('account_credit' in data) {
    totals.accountCredit = data.account_credit ? billingMoneyAmountFromJSON(data.account_credit) : null;
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
