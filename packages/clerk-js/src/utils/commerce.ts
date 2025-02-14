import type { CommerceMoney, CommerceMoneyJSON, CommerceTotals, CommerceTotalsJSON } from '@clerk/types';

export const commerceMoneyFromJSON = (data: CommerceMoneyJSON): CommerceMoney => {
  return {
    amount: data.amount,
    amountFormatted: data.amount_formatted,
    currency: data.currency,
    currencySymbol: data.currency_symbol,
  };
};

export const commerceTotalsFromJSON = (data: CommerceTotalsJSON): CommerceTotals => {
  return {
    grandTotal: commerceMoneyFromJSON(data.grand_total),
    subtotal: commerceMoneyFromJSON(data.subtotal),
    taxTotal: commerceMoneyFromJSON(data.tax_total),
    totalDueNow: data.total_due_now ? commerceMoneyFromJSON(data.total_due_now) : undefined,
  };
};
