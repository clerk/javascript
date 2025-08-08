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

export const commerceTotalsFromJSON = <T extends CommerceStatementTotalsJSON | CommerceCheckoutTotalsJSON>(data: T) => {
  const totals = {
    grandTotal: commerceFeeFromJSON(data.grand_total),
    subtotal: commerceFeeFromJSON(data.subtotal),
    taxTotal: commerceFeeFromJSON(data.tax_total),
  };
  if ('total_due_now' in data) {
    // @ts-ignore
    totals['totalDueNow'] = commerceFeeFromJSON(data.total_due_now);
  }
  if ('credit' in data) {
    // @ts-ignore
    totals['credit'] = commerceFeeFromJSON(data.credit);
  }
  if ('past_due' in data) {
    // @ts-ignore
    totals['pastDue'] = commerceFeeFromJSON(data.past_due);
  }

  return totals as T extends { total_due_now: CommerceFeeJSON } ? CommerceCheckoutTotals : CommerceStatementTotals;
};
