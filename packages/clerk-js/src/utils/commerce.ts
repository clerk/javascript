import type {
  CommerceCheckoutTotals,
  CommerceCheckoutTotalsJSON,
  CommerceMoney,
  CommerceMoneyJSON,
  CommerceStatementTotals,
  CommerceStatementTotalsJSON,
} from '@clerk/types';

export const commerceMoneyFromJSON = (data: CommerceMoneyJSON): CommerceMoney => {
  return {
    amount: data.amount,
    amountFormatted: data.amount_formatted,
    currency: data.currency,
    currencySymbol: data.currency_symbol,
  };
};

export const commerceTotalsFromJSON = <T extends CommerceStatementTotalsJSON | CommerceCheckoutTotalsJSON>(data: T) => {
  const totals = {
    grandTotal: commerceMoneyFromJSON(data.grand_total),
    subtotal: commerceMoneyFromJSON(data.subtotal),
    taxTotal: commerceMoneyFromJSON(data.tax_total),
  };
  if ('total_due_now' in data) {
    // @ts-ignore
    totals['totalDueNow'] = commerceMoneyFromJSON(data.total_due_now);
  }
  if ('credit' in data) {
    // @ts-ignore
    totals['credit'] = commerceMoneyFromJSON(data.credit);
  }

  return totals as T extends { total_due_now: CommerceMoneyJSON } ? CommerceCheckoutTotals : CommerceStatementTotals;
};
