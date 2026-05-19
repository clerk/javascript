import type { BillingMoneyAmountJSON, BillingPaymentTotalsJSON } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { billingPaymentTotalsFromJSON } from '../billing';

const moneyJSON = (amount: number): BillingMoneyAmountJSON => ({
  amount,
  amount_formatted: (amount / 100).toFixed(2),
  currency: 'USD',
  currency_symbol: '$',
});

describe('billingPaymentTotalsFromJSON', () => {
  it('maps subtotal, grand_total, and tax_total', () => {
    const data: BillingPaymentTotalsJSON = {
      subtotal: moneyJSON(4500),
      grand_total: moneyJSON(5000),
      tax_total: moneyJSON(500),
    };

    const totals = billingPaymentTotalsFromJSON(data);

    expect(totals.subtotal.amount).toBe(4500);
    expect(totals.grandTotal.amount).toBe(5000);
    expect(totals.taxTotal.amount).toBe(500);
    expect(totals.baseFee).toBeNull();
    expect(totals.perUnitTotals).toBeUndefined();
  });

  it('maps base_fee when present', () => {
    const data: BillingPaymentTotalsJSON = {
      subtotal: moneyJSON(5000),
      grand_total: moneyJSON(5000),
      tax_total: moneyJSON(0),
      base_fee: moneyJSON(1000),
    };

    expect(billingPaymentTotalsFromJSON(data).baseFee?.amount).toBe(1000);
  });

  it('maps per_unit_totals tiers with snake_case → camelCase conversion', () => {
    const data: BillingPaymentTotalsJSON = {
      subtotal: moneyJSON(5000),
      grand_total: moneyJSON(5000),
      tax_total: moneyJSON(0),
      per_unit_totals: [
        {
          name: 'seats',
          block_size: 1,
          tiers: [
            { quantity: 5, fee_per_block: moneyJSON(1000), total: moneyJSON(5000) },
            { quantity: null, fee_per_block: moneyJSON(0), total: moneyJSON(0) },
          ],
        },
      ],
    };

    const totals = billingPaymentTotalsFromJSON(data);

    expect(totals.perUnitTotals).toHaveLength(1);
    expect(totals.perUnitTotals?.[0].name).toBe('seats');
    expect(totals.perUnitTotals?.[0].blockSize).toBe(1);
    expect(totals.perUnitTotals?.[0].tiers[0]).toMatchObject({
      quantity: 5,
      feePerBlock: { amount: 1000 },
      total: { amount: 5000 },
    });
    expect(totals.perUnitTotals?.[0].tiers[1].quantity).toBeNull();
  });
});
