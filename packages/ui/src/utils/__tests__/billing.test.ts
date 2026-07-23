import { describe, expect, it } from 'vitest';

import { toNegativeAmount } from '../billing';

describe('toNegativeAmount', () => {
  it('converts positive amounts to negative', () => {
    const amount = {
      amount: 100,
      amountFormatted: '1.00',
      currency: 'usd',
      currencySymbol: '$',
    };
    expect(toNegativeAmount(amount)).toStrictEqual({
      amount: -100,
      amountFormatted: '-1.00',
      currency: 'usd',
      currencySymbol: '$',
    });
  });

  it('retains negative amounts', () => {
    const amount = {
      amount: -100,
      amountFormatted: '-1.00',
      currency: 'usd',
      currencySymbol: '$',
    };
    expect(toNegativeAmount(amount)).toStrictEqual({
      amount: -100,
      amountFormatted: '-1.00',
      currency: 'usd',
      currencySymbol: '$',
    });
  });
});
