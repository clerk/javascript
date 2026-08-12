import type { BillingMoneyAmount } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { formatLongDate, formatMoney, formatMonthYear, formatShortDate } from '../billing-format';

function money(overrides: Partial<BillingMoneyAmount> = {}): BillingMoneyAmount {
  return { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$', ...overrides };
}

describe('formatMoney', () => {
  it('formats a minor-unit amount as major-unit currency', () => {
    expect(formatMoney(money({ amount: 2000 }))).toBe('$20.00');
  });

  it('formats fractional amounts', () => {
    expect(formatMoney(money({ amount: 2050 }))).toBe('$20.50');
  });

  it('strips trailing zeros on whole amounts when short', () => {
    expect(formatMoney(money({ amount: 2000 }), true)).toBe('$20');
  });

  it('keeps the fraction on non-whole amounts when short', () => {
    expect(formatMoney(money({ amount: 2050 }), true)).toBe('$20.50');
  });

  it('falls back to USD when the currency is an empty string', () => {
    expect(formatMoney(money({ amount: 1000, currency: '' }))).toBe('$10.00');
  });

  it('falls back to the pre-formatted string when the currency code is invalid', () => {
    expect(formatMoney(money({ amount: 999, currency: 'US', currencySymbol: '£', amountFormatted: '9.99' }))).toBe(
      '£9.99',
    );
  });
});

describe('formatMonthYear', () => {
  it('renders the long month and year, no day', () => {
    expect(formatMonthYear(new Date(2024, 2, 15))).toBe('March 2024');
  });
});

describe('formatLongDate', () => {
  it('renders the long month, day, and year', () => {
    expect(formatLongDate(new Date(2024, 2, 15))).toBe('March 15, 2024');
  });
});

describe('formatShortDate', () => {
  it('returns an empty string for null', () => {
    expect(formatShortDate(null)).toBe('');
  });

  it('returns an empty string for undefined', () => {
    expect(formatShortDate(undefined)).toBe('');
  });

  it('returns an empty string for an unparseable value', () => {
    expect(formatShortDate('not-a-date')).toBe('');
  });

  it('includes the year for a date outside the current year', () => {
    expect(formatShortDate(new Date(2020, 0, 15))).toBe('Jan 15, 2020');
  });

  it('omits the year for a date in the current year', () => {
    const thisYear = new Date().getFullYear();
    expect(formatShortDate(new Date(thisYear, 0, 15))).toBe('Jan 15');
  });
});
