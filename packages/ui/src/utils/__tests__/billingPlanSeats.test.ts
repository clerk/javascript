import type { BillingMoneyAmount, BillingPaymentTotals, BillingPerUnitTotal } from '@clerk/shared/types';
import { describe, expect, test } from 'vitest';

import { getSeatsPerUnitTotal, summarizeSeatCharges } from '../billingPlanSeats';

const money = (amount: number): BillingMoneyAmount => ({
  amount,
  amountFormatted: (amount / 100).toFixed(2),
  currency: 'USD',
  currencySymbol: '$',
});

const baseTotals = (): BillingPaymentTotals => ({
  subtotal: money(5000),
  grandTotal: money(5000),
  taxTotal: money(0),
});

describe('getSeatsPerUnitTotal', () => {
  test('returns undefined when totals is null', () => {
    expect(getSeatsPerUnitTotal(null)).toBeUndefined();
  });

  test('returns undefined when totals is undefined', () => {
    expect(getSeatsPerUnitTotal(undefined)).toBeUndefined();
  });

  test('returns undefined when perUnitTotals is absent', () => {
    expect(getSeatsPerUnitTotal(baseTotals())).toBeUndefined();
  });

  test('returns undefined when no per-unit total has name "seats"', () => {
    const totals: BillingPaymentTotals = {
      ...baseTotals(),
      perUnitTotals: [
        {
          name: 'requests',
          blockSize: 1,
          tiers: [{ quantity: 100, feePerBlock: money(10), total: money(1000) }],
        },
      ],
    };
    expect(getSeatsPerUnitTotal(totals)).toBeUndefined();
  });

  test('finds the seats per-unit total', () => {
    const seats = {
      name: 'seats',
      blockSize: 1,
      tiers: [{ quantity: 5, feePerBlock: money(1000), total: money(5000) }],
    };
    const totals: BillingPaymentTotals = { ...baseTotals(), perUnitTotals: [seats] };
    expect(getSeatsPerUnitTotal(totals)).toBe(seats);
  });

  test('matches "seats" case-insensitively', () => {
    const seats = {
      name: 'Seats',
      blockSize: 1,
      tiers: [{ quantity: null, feePerBlock: money(0), total: money(0) }],
    };
    const totals: BillingPaymentTotals = { ...baseTotals(), perUnitTotals: [seats] };
    expect(getSeatsPerUnitTotal(totals)).toBe(seats);
  });
});

describe('summarizeSeatCharges', () => {
  test('returns null when seatsTotal is undefined', () => {
    expect(summarizeSeatCharges(undefined)).toBeNull();
  });

  test('returns null when no tier has a positive fee (plan with only a free tier / under-included scenario)', () => {
    const seats: BillingPerUnitTotal = {
      name: 'seats',
      blockSize: 1,
      tiers: [{ quantity: 10, feePerBlock: money(0), total: money(0) }],
    };
    expect(summarizeSeatCharges(seats)).toBeNull();
  });

  test('summarizes a paid-only plan (no included tier)', () => {
    const seats: BillingPerUnitTotal = {
      name: 'seats',
      blockSize: 1,
      tiers: [{ quantity: 5, feePerBlock: money(500), total: money(2500) }],
    };
    const summary = summarizeSeatCharges(seats);
    expect(summary).not.toBeNull();
    expect(summary!.used).toBe(5);
    expect(summary!.included).toBe(0);
    expect(summary!.paidTier.feePerBlock.amount).toBe(500);
    expect(summary!.paidTier.total.amount).toBe(2500);
  });

  test('summarizes a mixed (included + paid) plan', () => {
    const seats: BillingPerUnitTotal = {
      name: 'seats',
      blockSize: 1,
      tiers: [
        { quantity: 3, feePerBlock: money(0), total: money(0) },
        { quantity: 2, feePerBlock: money(500), total: money(1000) },
      ],
    };
    const summary = summarizeSeatCharges(seats);
    expect(summary).not.toBeNull();
    expect(summary!.used).toBe(5);
    expect(summary!.included).toBe(3);
    expect(summary!.paidTier.feePerBlock.amount).toBe(500);
    expect(summary!.paidTier.total.amount).toBe(1000);
  });

  test('treats null-quantity (unlimited) tiers as 0 in the count', () => {
    const seats: BillingPerUnitTotal = {
      name: 'seats',
      blockSize: 1,
      tiers: [{ quantity: null, feePerBlock: money(500), total: money(0) }],
    };
    const summary = summarizeSeatCharges(seats);
    expect(summary).not.toBeNull();
    expect(summary!.used).toBe(0);
    expect(summary!.included).toBe(0);
  });
});
