import { describe, expect, it, vi } from 'vitest';

import { formatAmount } from '../useCurrencyFormatter';

describe('formatAmount', () => {
  it('formats USD in the en-US locale', () => {
    const amount = {
      amount: 1000,
      amountFormatted: '10.00',
      currency: 'USD',
      currencySymbol: '$',
    };

    expect(formatAmount('en-US', amount)).toBe('$10.00');
  });

  it('formats USD in the fr-FR locale', () => {
    const amount = {
      amount: 100000,
      amountFormatted: '1000.00',
      currency: 'USD',
      currencySymbol: '$',
    };

    // the formatter uses a non-breaking space
    expect(formatAmount('fr-FR', amount)).toBe('1\u202f000,00\u00a0$US');
  });

  it('formats JPY in the ja-JP locale', () => {
    const amount = {
      amount: 10000,
      amountFormatted: '10000',
      currency: 'JPY',
      currencySymbol: '\u00a5',
    };

    // the formatter uses a specific yen symbol
    expect(formatAmount('ja-JP', amount)).toBe('\uffe510,000');
  });

  it('formats USD in the en-US locale with no decimal', () => {
    const amount = {
      amount: 1000,
      amountFormatted: '10.00',
      currency: 'USD',
      currencySymbol: '$',
    };

    expect(formatAmount('en-US', amount, { style: 'short' })).toBe('$10');
  });

  it('formats USD in the en-US locale with decimals if present', () => {
    const amount = {
      amount: 1099,
      amountFormatted: '10.99',
      currency: 'USD',
      currencySymbol: '$',
    };

    expect(formatAmount('en-US', amount, { style: 'short' })).toBe('$10.99');
  });

  it('treats an empty currency as USD', () => {
    const amount = {
      amount: 0,
      amountFormatted: '0.00',
      currency: '',
      currencySymbol: '$',
    };

    expect(formatAmount('en-US', amount, { style: 'short' })).toBe('$0');
  });

  it('falls back to naive formatting when Intl.NumberFormat throws', () => {
    const amount = {
      amount: 1000,
      currency: 'USD',
      // these values are specifically wrong to assert it's using them as fallbacks
      amountFormatted: '99.99',
      currencySymbol: '_',
    };

    const spy = vi.spyOn(Intl, 'NumberFormat').mockImplementation(() => {
      throw new Error('Intl unavailable');
    });

    try {
      // specifically using a locale not used in other tests to force the creation of a new instance of NumberFormat
      expect(formatAmount('en-XA', amount)).toBe('_99.99');
      expect(spy).toHaveBeenCalledTimes(1);
    } finally {
      spy.mockRestore();
    }
  });
});
