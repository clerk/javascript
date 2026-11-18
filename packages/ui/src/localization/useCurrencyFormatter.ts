import type { BillingMoneyAmount } from '@clerk/shared/types/billing';
import { useCallback } from 'react';

const formatters: Map<string, Intl.NumberFormat> = new Map();

function mapKey(locale: string, formattingOptions: Intl.NumberFormatOptions) {
  return locale + '-' + JSON.stringify(formattingOptions);
}

function getFormatter(locale: string, formattingOptions: Intl.NumberFormatOptions) {
  const key = mapKey(locale, formattingOptions);
  let formatter = formatters.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, formattingOptions);
    formatters.set(key, formatter);
  }

  return formatter;
}

export interface FormatAmountOptions {
  style?: 'short';
}

export function formatAmount(locale: string, amount: BillingMoneyAmount, options?: FormatAmountOptions): string {
  try {
    // we use the base formatter to determine the maximumFractionDigits, which ensures we divide by the correct value
    // to convert from minor to major units
    const baseFormattingOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      // currently, default free plans have their currency set to a blank string. To prevent unintended results,
      // default to USD.
      currency: amount.currency !== '' ? amount.currency : 'USD',
    };
    const baseFormatter = getFormatter(locale, baseFormattingOptions);
    const { maximumFractionDigits } = baseFormatter.resolvedOptions();
    let formatter = baseFormatter;

    // if we provide additional formatting options, we get a new formatter
    if (options?.style === 'short') {
      formatter = getFormatter(locale, {
        ...baseFormattingOptions,
        trailingZeroDisplay: 'stripIfInteger',
      });
    }

    // fallback to 2 maximum fraction digits (which covers USD, EUR, and most other major currencies)
    return formatter.format(amount.amount / 10 ** (maximumFractionDigits ?? 2));
  } catch {
    // if anything fails, fall back to naive formatting
    return `${amount.currencySymbol}${amount.amountFormatted}`;
  }
}

export function useCurrencyFormatter(locale: string) {
  return useCallback(
    (amount: BillingMoneyAmount, options?: FormatAmountOptions) => formatAmount(locale, amount, options),
    [locale],
  );
}
