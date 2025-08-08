import type {
  CommerceCheckoutTotals,
  CommerceCheckoutTotalsJSON,
  CommerceFee,
  CommerceFeeJSON,
  CommerceStatementTotals,
  CommerceStatementTotalsJSON,
} from '@clerk/types';

export const commerceFeeFromJSON = (data: CommerceFeeJSON): CommerceFee => {
  return {
    amount: data.amount,
    amountFormatted: data.amount_formatted,
    currency: data.currency,
    currencySymbol: data.currency_symbol,
  };
};

const hasPastDue = (data: unknown): data is { past_due: CommerceFeeJSON } => {
  return typeof data === 'object' && data !== null && 'past_due' in data;
};

export const commerceTotalsFromJSON = <T extends CommerceStatementTotalsJSON | CommerceCheckoutTotalsJSON>(
  data: T,
): T extends { total_due_now: CommerceFeeJSON } ? CommerceCheckoutTotals : CommerceStatementTotals => {
  const totals: Partial<CommerceCheckoutTotals & CommerceStatementTotals> = {
    grandTotal: commerceFeeFromJSON(data.grand_total),
    subtotal: commerceFeeFromJSON(data.subtotal),
    taxTotal: commerceFeeFromJSON(data.tax_total),
  };

  if ('total_due_now' in data) {
    totals.totalDueNow = commerceFeeFromJSON(data.total_due_now);
  }
  if ('credit' in data) {
    totals.credit = commerceFeeFromJSON(data.credit);
  }
  if (hasPastDue(data)) {
    totals.pastDue = commerceFeeFromJSON(data.past_due);
  }

  return totals as T extends { total_due_now: CommerceFeeJSON } ? CommerceCheckoutTotals : CommerceStatementTotals;
};
