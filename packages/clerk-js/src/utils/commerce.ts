import type {
  __experimental_CommerceCheckoutTotals,
  __experimental_CommerceCheckoutTotalsJSON,
  __experimental_CommerceInvoiceTotals,
  __experimental_CommerceInvoiceTotalsJSON,
  __experimental_CommerceMoney,
  __experimental_CommerceMoneyJSON,
} from '@clerk/types';

export const commerceMoneyFromJSON = (data: __experimental_CommerceMoneyJSON): __experimental_CommerceMoney => {
  return {
    amount: data.amount,
    amountFormatted: data.amount_formatted,
    currency: data.currency,
    currencySymbol: data.currency_symbol,
  };
};

export const commerceTotalsFromJSON = <
  T extends __experimental_CommerceInvoiceTotalsJSON | __experimental_CommerceCheckoutTotalsJSON,
>(
  data: T,
) => {
  const totals = {
    grandTotal: commerceMoneyFromJSON(data.grand_total),
    subtotal: commerceMoneyFromJSON(data.subtotal),
    taxTotal: commerceMoneyFromJSON(data.tax_total),
  };
  if ('total_due_now' in data) {
    // @ts-ignore
    totals['totalDueNow'] = commerceMoneyFromJSON(data.total_due_now);
  }
  if ('proration' in data) {
    // @ts-ignore
    totals['proration'] = {
      // @ts-ignore
      days: data.proration.days,
      // @ts-ignore
      ratePerDay: commerceMoneyFromJSON(data.proration.rate_per_day),
      // @ts-ignore
      totalProration: commerceMoneyFromJSON(data.proration.total_proration),
    };
  }

  return totals as T extends { total_due_now: __experimental_CommerceMoneyJSON }
    ? __experimental_CommerceCheckoutTotals
    : __experimental_CommerceInvoiceTotals;
};
