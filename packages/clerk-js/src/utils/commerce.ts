import type {
  __experimental_CommerceMoney,
  __experimental_CommerceMoneyJSON,
  __experimental_CommerceTotals,
  __experimental_CommerceTotalsJSON,
} from '@clerk/types';

export const commerceMoneyFromJSON = (data: __experimental_CommerceMoneyJSON): __experimental_CommerceMoney => {
  return {
    amount: data.amount,
    amountFormatted: data.amount_formatted,
    currency: data.currency,
    currencySymbol: data.currency_symbol,
  };
};

export const commerceTotalsFromJSON = (data: __experimental_CommerceTotalsJSON): __experimental_CommerceTotals => {
  return {
    grandTotal: commerceMoneyFromJSON(data.grand_total),
    subtotal: commerceMoneyFromJSON(data.subtotal),
    taxTotal: commerceMoneyFromJSON(data.tax_total),
    totalDueNow: data.total_due_now ? commerceMoneyFromJSON(data.total_due_now) : undefined,
  };
};
