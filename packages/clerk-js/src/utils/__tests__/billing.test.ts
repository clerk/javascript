import type {
  BillingMoneyAmountJSON,
  BillingPaymentTotalsJSON,
  BillingSubscriptionItemNextPaymentJSON,
  BillingSubscriptionNextPaymentJSON,
  BillingTotalsJSON,
} from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import {
  billingDiscountRedemptionFromJSON,
  billingPaymentTotalsFromJSON,
  billingSubscriptionItemNextPaymentFromJSON,
  billingSubscriptionNextPaymentFromJSON,
} from '../billing';

const moneyJSON = (amount: number): BillingMoneyAmountJSON => ({
  amount,
  amount_formatted: (amount / 100).toFixed(2),
  currency: 'USD',
  currency_symbol: '$',
});

const nextPaymentTotalsJSON = (): BillingTotalsJSON => ({
  subtotal: moneyJSON(5000),
  base_fee: moneyJSON(1000),
  tax_total: moneyJSON(500),
  grand_total: moneyJSON(5500),
  credits: {
    proration: null,
    payer: {
      remaining_balance: moneyJSON(2000),
      applied_amount: moneyJSON(1000),
    },
    total: moneyJSON(1000),
  },
  discounts: {
    proration: {
      amount: moneyJSON(500),
      cycle_days_passed: 15,
      cycle_days_total: 30,
      cycle_passed_percent: 50,
    },
    discount: {
      amount: moneyJSON(1000),
      discount_id: 'discount_123',
      name: 'Welcome',
      effect: 'percentage',
      percent_off: 20,
      promo_code: 'WELCOME20',
      cycles_remaining: 2,
    },
    total: moneyJSON(500),
  },
  total_due_after_free_trial: null,
  credit: null,
  past_due: null,
  total_due_now: moneyJSON(4500),
  per_unit_totals: [
    {
      name: 'seats',
      block_size: 1,
      tiers: [{ quantity: 5, fee_per_block: moneyJSON(1000), total: moneyJSON(5000) }],
    },
  ],
  totals_due_per_period: {
    subtotal: moneyJSON(10000),
    base_fee: moneyJSON(1000),
    tax_total: moneyJSON(1000),
    grand_total: moneyJSON(11000),
    per_unit_totals: [
      {
        name: 'seats',
        block_size: 1,
        tiers: [{ quantity: 10, fee_per_block: moneyJSON(1000), total: moneyJSON(10000) }],
      },
    ],
  },
  total_due_per_period: moneyJSON(11000),
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

  it('maps discounts when present', () => {
    const data: BillingPaymentTotalsJSON = {
      subtotal: moneyJSON(500),
      grand_total: moneyJSON(484),
      tax_total: moneyJSON(0),
      discounts: {
        proration: {
          amount: moneyJSON(16),
          cycle_days_passed: 1,
          cycle_days_total: 30,
          cycle_passed_percent: 3,
        },
        discount: {
          amount: moneyJSON(100),
          discount_id: 'discount_123',
          name: 'Fixed discount',
          effect: 'fixed_amount',
          amount_off: moneyJSON(100),
          cycles_remaining: null,
        },
        total: moneyJSON(16),
      },
    };

    const totals = billingPaymentTotalsFromJSON(data);

    expect(totals.discounts?.proration?.amount.amount).toBe(16);
    expect(totals.discounts?.proration?.cycleDaysPassed).toBe(1);
    expect(totals.discounts?.discount).toMatchObject({
      amount: { amount: 100 },
      discountId: 'discount_123',
      name: 'Fixed discount',
      effect: 'fixed_amount',
      amountOff: { amount: 100, amountFormatted: '1.00', currency: 'USD', currencySymbol: '$' },
      cyclesRemaining: null,
    });
    expect(totals.discounts?.total.amount).toBe(16);
  });

  it('defaults discounts to null when absent', () => {
    const data: BillingPaymentTotalsJSON = {
      subtotal: moneyJSON(500),
      grand_total: moneyJSON(500),
      tax_total: moneyJSON(0),
    };

    expect(billingPaymentTotalsFromJSON(data).discounts).toBeNull();
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

describe('billingSubscriptionNextPaymentFromJSON', () => {
  it('maps amount, date, and per_unit_totals', () => {
    const data: BillingSubscriptionNextPaymentJSON = {
      amount: moneyJSON(5000),
      date: 1_609_459_200_000,
      per_unit_totals: [
        {
          name: 'seats',
          block_size: 1,
          tiers: [{ quantity: 5, fee_per_block: moneyJSON(1000), total: moneyJSON(5000) }],
        },
      ],
      totals: nextPaymentTotalsJSON(),
    };

    const nextPayment = billingSubscriptionNextPaymentFromJSON(data);

    expect(nextPayment.amount.amount).toBe(5000);
    expect(nextPayment.date).toEqual(new Date('2021-01-01T00:00:00.000Z'));
    expect(nextPayment.perUnitTotals?.[0]).toMatchObject({
      name: 'seats',
      blockSize: 1,
      tiers: [{ quantity: 5, feePerBlock: { amount: 1000 }, total: { amount: 5000 } }],
    });
    expect(nextPayment.totals).toMatchObject({
      subtotal: { amount: 5000 },
      baseFee: { amount: 1000 },
      taxTotal: { amount: 500 },
      grandTotal: { amount: 5500 },
      totalDueAfterFreeTrial: null,
      credit: null,
      pastDue: null,
      totalDueNow: { amount: 4500 },
      totalDuePerPeriod: { amount: 11000 },
      credits: {
        payer: {
          remainingBalance: { amount: 2000 },
          appliedAmount: { amount: 1000 },
        },
        total: { amount: 1000 },
      },
      discounts: {
        proration: {
          amount: { amount: 500 },
          cycleDaysPassed: 15,
          cycleDaysTotal: 30,
          cyclePassedPercent: 50,
        },
        discount: {
          amount: { amount: 1000 },
          discountId: 'discount_123',
          name: 'Welcome',
          effect: 'percentage',
          percentOff: 20,
          promoCode: 'WELCOME20',
          cyclesRemaining: 2,
        },
        total: { amount: 500 },
      },
      perUnitTotals: [{ name: 'seats', blockSize: 1 }],
      totalsDuePerPeriod: {
        subtotal: { amount: 10000 },
        baseFee: { amount: 1000 },
        taxTotal: { amount: 1000 },
        grandTotal: { amount: 11000 },
        perUnitTotals: [{ name: 'seats', blockSize: 1 }],
      },
    });
  });
});

describe('billingDiscountRedemptionFromJSON', () => {
  it('maps an applied subscription item discount', () => {
    const discount = billingDiscountRedemptionFromJSON({
      object: 'commerce_discount_redemption',
      id: 'redemption_123',
      subscription_item_id: 'sub_item_123',
      discount_id: 'discount_123',
      name: 'Welcome',
      source: 'promo_code',
      promo_code: 'WELCOME20',
      effect: 'fixed_amount',
      amount_off: moneyJSON(500),
      amount: moneyJSON(400),
      cycles_remaining: 2,
      cycles_applied: 1,
      status: 'active',
      redeemed_at: 1_609_459_200_000,
      redeemed_by: 'user_123',
    });

    expect(discount).toMatchObject({
      id: 'redemption_123',
      subscriptionItemId: 'sub_item_123',
      discountId: 'discount_123',
      name: 'Welcome',
      source: 'promo_code',
      promoCode: 'WELCOME20',
      effect: 'fixed_amount',
      amountOff: {
        amount: 500,
        amountFormatted: '5.00',
        currency: 'USD',
        currencySymbol: '$',
      },
      amount: {
        amount: 400,
        amountFormatted: '4.00',
        currency: 'USD',
        currencySymbol: '$',
      },
      cyclesRemaining: 2,
      cyclesApplied: 1,
      status: 'active',
      redeemedAt: new Date('2021-01-01T00:00:00.000Z'),
      redeemedBy: 'user_123',
    });
  });
});

describe('billingSubscriptionItemNextPaymentFromJSON', () => {
  it('maps amount, date, and per_unit_totals', () => {
    const data: BillingSubscriptionItemNextPaymentJSON = {
      amount: moneyJSON(5000),
      date: 1_609_459_200_000,
      per_unit_totals: [
        {
          name: 'seats',
          block_size: 1,
          tiers: [{ quantity: 5, fee_per_block: moneyJSON(1000), total: moneyJSON(5000) }],
        },
      ],
      totals: nextPaymentTotalsJSON(),
    };

    const nextPayment = billingSubscriptionItemNextPaymentFromJSON(data);

    expect(nextPayment.amount.amount).toBe(5000);
    expect(nextPayment.date).toEqual(new Date('2021-01-01T00:00:00.000Z'));
    expect(nextPayment.perUnitTotals?.[0]).toMatchObject({
      name: 'seats',
      blockSize: 1,
      tiers: [{ quantity: 5, feePerBlock: { amount: 1000 }, total: { amount: 5000 } }],
    });
    expect(nextPayment.totals).toMatchObject({
      subtotal: { amount: 5000 },
      baseFee: { amount: 1000 },
      totalDueNow: { amount: 4500 },
      credits: { total: { amount: 1000 } },
      discounts: { total: { amount: 500 } },
      perUnitTotals: [{ name: 'seats', blockSize: 1 }],
    });
  });
});
