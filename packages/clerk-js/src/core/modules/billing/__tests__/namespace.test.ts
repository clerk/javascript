import type { BillingSubscriptionItemJSON } from '@clerk/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BaseResource, BillingSubscriptionItem } from '../../../resources/internal';
import { Billing } from '../namespace';

const subscriptionItemJSON = {
  object: 'commerce_subscription_item',
  id: 'sub_item_123',
  plan: {
    object: 'commerce_plan',
    id: 'plan_123',
    name: 'Pro',
    fee: { amount: 1000, amount_formatted: '10.00', currency: 'USD', currency_symbol: '$' },
    annual_fee: null,
    annual_monthly_fee: null,
    description: null,
    is_default: false,
    is_recurring: true,
    has_base_fee: true,
    for_payer_type: 'user',
    publicly_visible: true,
    slug: 'pro',
    avatar_url: null,
    store_products: [{ store: 'apple', product_id: 'com.acme.pro.monthly', purchase_option_id: null }],
  },
  plan_period: 'month',
  price_id: 'price_123',
  status: 'active',
  created_at: 1720000000000,
  period_start: 1720000000000,
  period_end: 1722592000000,
  canceled_at: null,
  past_due_at: null,
  is_free_trial: false,
  managed_by: 'apple',
} as unknown as BillingSubscriptionItemJSON;

describe('Billing namespace', () => {
  const billing = new Billing();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('preflightStorePurchase', () => {
    it('POSTs the exact mapped store purchase option before purchase', async () => {
      // @ts-expect-error - _fetch is protected
      BaseResource._fetch = vi.fn().mockResolvedValue({ response: { allowed: true } });

      await billing.preflightStorePurchase({
        store: 'google',
        productId: 'acme_pro',
        purchaseOptionId: 'annual',
      });

      // @ts-expect-error - _fetch is protected
      expect(BaseResource._fetch).toHaveBeenCalledWith({
        path: '/me/billing/store_purchases/preflight',
        method: 'POST',
        body: {
          store: 'google',
          product_id: 'acme_pro',
          purchase_option_id: 'annual',
        },
      });
    });
  });

  describe('registerStorePurchase', () => {
    it('POSTs the store and payload form fields to /me/billing/store_purchases', async () => {
      // @ts-expect-error - _fetch is protected
      BaseResource._fetch = vi.fn().mockResolvedValue({ response: subscriptionItemJSON });

      await billing.registerStorePurchase({
        store: 'apple',
        payload: 'signed.jws.transaction',
      });

      // @ts-expect-error - _fetch is protected
      expect(BaseResource._fetch).toHaveBeenCalledWith({
        path: '/me/billing/store_purchases',
        method: 'POST',
        body: {
          store: 'apple',
          payload: 'signed.jws.transaction',
        },
      });
    });

    it('supports google purchase tokens', async () => {
      // @ts-expect-error - _fetch is protected
      BaseResource._fetch = vi.fn().mockResolvedValue({ response: { ...subscriptionItemJSON, managed_by: 'google' } });

      await billing.registerStorePurchase({
        store: 'google',
        payload: 'play-purchase-token',
      });

      // @ts-expect-error - _fetch is protected
      expect(BaseResource._fetch).toHaveBeenCalledWith({
        path: '/me/billing/store_purchases',
        method: 'POST',
        body: {
          store: 'google',
          payload: 'play-purchase-token',
        },
      });
    });

    it('passes the source form field through to the request body when provided', async () => {
      // @ts-expect-error - _fetch is protected
      BaseResource._fetch = vi.fn().mockResolvedValue({ response: subscriptionItemJSON });

      await billing.registerStorePurchase({
        store: 'apple',
        payload: 'signed.jws.transaction',
        source: 'restore',
      });

      // @ts-expect-error - _fetch is protected
      expect(BaseResource._fetch).toHaveBeenCalledWith({
        path: '/me/billing/store_purchases',
        method: 'POST',
        body: {
          store: 'apple',
          payload: 'signed.jws.transaction',
          source: 'restore',
        },
      });
    });

    it('supports passive sync without granting restore transfer semantics', async () => {
      // @ts-expect-error - _fetch is protected
      BaseResource._fetch = vi.fn().mockResolvedValue({ response: subscriptionItemJSON });

      await billing.registerStorePurchase({
        store: 'apple',
        payload: 'signed.jws.transaction',
        source: 'sync',
      });

      // @ts-expect-error - _fetch is protected
      expect(BaseResource._fetch).toHaveBeenCalledWith({
        path: '/me/billing/store_purchases',
        method: 'POST',
        body: {
          store: 'apple',
          payload: 'signed.jws.transaction',
          source: 'sync',
        },
      });
    });

    it('omits the source form field when not provided', async () => {
      // @ts-expect-error - _fetch is protected
      BaseResource._fetch = vi.fn().mockResolvedValue({ response: subscriptionItemJSON });

      await billing.registerStorePurchase({ store: 'apple', payload: 'signed.jws.transaction' });

      // @ts-expect-error - _fetch is protected
      const body = (BaseResource._fetch as ReturnType<typeof vi.fn>).mock.calls[0][0].body;
      expect(body).not.toHaveProperty('source');
    });

    it('deserializes the response into a BillingSubscriptionItem', async () => {
      // @ts-expect-error - _fetch is protected
      BaseResource._fetch = vi.fn().mockResolvedValue({ response: subscriptionItemJSON });

      const item = await billing.registerStorePurchase({
        store: 'apple',
        payload: 'signed.jws.transaction',
      });

      expect(item).toBeInstanceOf(BillingSubscriptionItem);
      expect(item).toMatchObject({
        id: 'sub_item_123',
        status: 'active',
        planPeriod: 'month',
        managedBy: 'apple',
      });
      expect(item.plan.storeProducts).toEqual([{ store: 'apple', productId: 'com.acme.pro.monthly' }]);
    });

    it('propagates API errors', async () => {
      const apiError = new Error('already subscribed');
      // @ts-expect-error - _fetch is protected
      BaseResource._fetch = vi.fn().mockRejectedValue(apiError);

      await expect(billing.registerStorePurchase({ store: 'apple', payload: 'signed.jws.transaction' })).rejects.toBe(
        apiError,
      );
    });
  });

  describe('getPlans', () => {
    it('requests user plans from /billing/plans', async () => {
      // @ts-expect-error - _fetch is protected
      BaseResource._fetch = vi.fn().mockResolvedValue({ data: [], total_count: 0 });

      await billing.getPlans({ for: 'user' });

      // @ts-expect-error - _fetch is protected
      expect(BaseResource._fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/billing/plans',
          method: 'GET',
        }),
      );
    });
  });
});
