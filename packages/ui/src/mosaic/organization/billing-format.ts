import type { BillingMoneyAmount } from '@clerk/shared/types';

/**
 * The Mosaic layer renders `en-US` copy (matching the other migrated sections), so currency and
 * dates are formatted directly rather than through the localization pipeline. `formatMoney` mirrors
 * `formatAmount` (minor→major unit conversion via the base formatter's fraction digits) and
 * `formatShortDate` mirrors the `shortDate('en-US')` localization modifier the legacy strings used,
 * so output stays 1:1.
 */
export const formatMoney = (amount: BillingMoneyAmount, short = false): string => {
  try {
    const currency = amount.currency !== '' ? amount.currency : 'USD';
    const base = new Intl.NumberFormat('en-US', { style: 'currency', currency });
    const { maximumFractionDigits } = base.resolvedOptions();
    const formatter = short
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency, trailingZeroDisplay: 'stripIfInteger' })
      : base;
    return formatter.format(amount.amount / 10 ** (maximumFractionDigits ?? 2));
  } catch {
    return `${amount.currencySymbol}${amount.amountFormatted}`;
  }
};

// Mirror the legacy `formatDate(date, 'monthyear')` used by the statements list.
export const formatMonthYear = (value: Date): string =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(value);

// Mirror the legacy `formatDate(date, 'long')` used by the payment-attempts list.
export const formatLongDate = (value: Date): string =>
  new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(value);

export const formatShortDate = (value: Date | string | number | null | undefined): string => {
  if (value == null) {
    return '';
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {}),
  }).format(date);
};
