import type {
  CommerceCheckoutTotals,
  CommerceCheckoutTotalsJSON,
  CommerceMoneyAmount,
  CommerceMoneyAmountJSON,
  CommerceStatementTotals,
  CommerceStatementTotalsJSON,
} from '@clerk/types';

export const commerceMoneyAmountFromJSON = (data: CommerceMoneyAmountJSON): CommerceMoneyAmount => {
  return {
    amount: data.amount,
    amountFormatted: data.amount_formatted,
    currency: data.currency,
    currencySymbol: data.currency_symbol,
  };
};

const hasPastDue = (data: unknown): data is { past_due: CommerceMoneyAmountJSON } => {
  return typeof data === 'object' && data !== null && 'past_due' in data;
};

export const commerceTotalsFromJSON = <T extends CommerceStatementTotalsJSON | CommerceCheckoutTotalsJSON>(
  data: T,
): T extends { total_due_now: CommerceMoneyAmountJSON } ? CommerceCheckoutTotals : CommerceStatementTotals => {
  const totals: Partial<CommerceCheckoutTotals & CommerceStatementTotals> = {
    grandTotal: commerceMoneyAmountFromJSON(data.grand_total),
    subtotal: commerceMoneyAmountFromJSON(data.subtotal),
    taxTotal: commerceMoneyAmountFromJSON(data.tax_total),
  };

  if ('total_due_now' in data) {
    totals.totalDueNow = commerceMoneyAmountFromJSON(data.total_due_now);
  }
  if ('credit' in data) {
    totals.credit = commerceMoneyAmountFromJSON(data.credit);
  }
  if (hasPastDue(data)) {
    totals.pastDue = commerceMoneyAmountFromJSON(data.past_due);
  }

  return totals as T extends { total_due_now: CommerceMoneyAmountJSON }
    ? CommerceCheckoutTotals
    : CommerceStatementTotals;
};
