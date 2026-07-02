import { createHash } from 'node:crypto';

import { ClerkAPIResponseError } from '@clerk/shared/error';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { IAPBillingError } from '../errors';
import { isIAPBillingError } from '../errors';
import { useIAPBilling } from '../useIAPBilling';

const mocks = vi.hoisted(() => {
  type AnyListener = (event: any) => void;

  const purchaseListeners: AnyListener[] = [];
  const errorListeners: AnyListener[] = [];

  const subscribe = (listeners: AnyListener[], listener: AnyListener) => {
    listeners.push(listener);
    return {
      remove: () => {
        const index = listeners.indexOf(listener);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
      },
    };
  };

  // Ordered log of the calls whose relative ordering is contractual (server-first, then finish).
  const callLog: string[] = [];

  const iap = {
    initConnection: vi.fn(async () => true),
    purchaseUpdatedListener: vi.fn((listener: AnyListener) => subscribe(purchaseListeners, listener)),
    purchaseErrorListener: vi.fn((listener: AnyListener) => subscribe(errorListeners, listener)),
    // expo-iap's requestPurchase is event-based: the outcome arrives via the listeners, not the return value.
    requestPurchase: vi.fn(async () => null),
    fetchProducts: vi.fn(async (): Promise<any[]> => []),
    finishTransaction: vi.fn(async () => {
      callLog.push('finishTransaction');
    }),
    getAvailablePurchases: vi.fn(async (): Promise<any[]> => []),
  };

  return {
    Platform: { OS: 'ios' },
    iap,
    callLog,
    purchaseListeners,
    errorListeners,
    emitPurchase: (purchase: any) => [...purchaseListeners].forEach(listener => listener(purchase)),
    emitPurchaseError: (error: any) => [...errorListeners].forEach(listener => listener(error)),
    useClerk: vi.fn(),
  };
});

vi.mock('react-native', () => ({ Platform: mocks.Platform }));

vi.mock('@clerk/react', () => ({ useClerk: mocks.useClerk }));

// The optional expo-iap dependency is loaded through the relative ./expoIap module (vi.mock cannot intercept the
// synchronous require('expo-iap') call itself).
vi.mock('../expoIap', () => ({
  loadExpoIap: () => mocks.iap,
  ensureIapConnection: (iap: { initConnection: () => Promise<unknown> }) => iap.initConnection(),
}));

// Same for expo-crypto: reimplement the digest API with node:crypto so the user-binding tokens are derived for real.
vi.mock('../expoCrypto', () => {
  const nodeAlgorithm = (algorithm: string) => (algorithm === 'SHA-1' ? 'sha1' : 'sha256');
  return {
    loadExpoCrypto: () => ({
      CryptoDigestAlgorithm: { SHA1: 'SHA-1', SHA256: 'SHA-256' },
      CryptoEncoding: { HEX: 'hex' },
      digest: async (algorithm: string, data: Uint8Array) => {
        const hash = createHash(nodeAlgorithm(algorithm)).update(Buffer.from(data)).digest();
        return hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength);
      },
      digestStringAsync: async (algorithm: string, data: string) =>
        createHash(nodeAlgorithm(algorithm)).update(data, 'utf8').digest('hex'),
    }),
  };
});

const USER_ID = 'user_2x1aBcD3fGhIjKlMnOpQrStUvWx';
// Golden vector from the store-purchase contract: UUIDv5 of the raw user ID.
const APPLE_APP_ACCOUNT_TOKEN = '8e08cd79-73d8-53ba-b576-0286add357e6';
const GOOGLE_OBFUSCATED_ACCOUNT_ID = createHash('sha256').update(USER_ID, 'utf8').digest('hex').slice(0, 64);

const plan = {
  id: 'plan_123',
  storeProducts: [
    { store: 'apple', productId: 'com.acme.pro.monthly', period: 'month' },
    { store: 'google', productId: 'acme_pro_monthly', period: 'month' },
  ],
} as any;

const subscriptionItem = { id: 'sub_item_123', status: 'active', managedBy: 'apple' } as any;

const applePurchase = {
  id: 'txn_1',
  productId: 'com.acme.pro.monthly',
  purchaseToken: 'signed.jws.transaction',
  store: 'apple',
  platform: 'ios',
} as any;

const googlePurchase = {
  id: 'txn_2',
  productId: 'acme_pro_monthly',
  purchaseToken: 'play-purchase-token',
  store: 'google',
  platform: 'android',
} as any;

const alreadySubscribedError = new ClerkAPIResponseError('conflict', {
  status: 409,
  data: [
    {
      code: 'already_subscribed',
      message: 'Already subscribed',
      meta: { already_subscribed_via: 'stripe' },
    },
  ],
});

describe('useIAPBilling', () => {
  let clerk: any;
  let registerStorePurchase: ReturnType<typeof vi.fn>;
  let getToken: ReturnType<typeof vi.fn>;

  const renderIAPBilling = async () => {
    const rendered = renderHook(() => useIAPBilling());
    // Flush the initial refetch and the out-of-band listener registration.
    await act(async () => {});
    return rendered;
  };

  beforeEach(() => {
    mocks.Platform.OS = 'ios';
    mocks.callLog.length = 0;
    mocks.purchaseListeners.length = 0;
    mocks.errorListeners.length = 0;

    registerStorePurchase = vi.fn(async () => {
      mocks.callLog.push('registerStorePurchase');
      return subscriptionItem;
    });
    getToken = vi.fn(async () => 'jwt');

    clerk = {
      loaded: true,
      user: { id: USER_ID },
      session: { getToken },
      telemetry: { record: vi.fn() },
      billing: {
        getPlans: vi.fn(async () => ({ data: [plan], total_count: 1 })),
        getSubscription: vi.fn(async () => ({ subscriptionItems: [subscriptionItem] })),
        registerStorePurchase: registerStorePurchase,
      },
    };
    mocks.useClerk.mockReturnValue(clerk);

    mocks.iap.requestPurchase.mockImplementation(async () => {
      mocks.emitPurchase(mocks.Platform.OS === 'ios' ? applePurchase : googlePurchase);
      return null;
    });
    mocks.iap.fetchProducts.mockResolvedValue([
      {
        id: 'acme_pro_monthly',
        platform: 'android',
        subscriptionOffers: [{ offerTokenAndroid: 'offer_token_1' }],
      },
    ]);
    mocks.iap.getAvailablePurchases.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches plans and current subscription items on mount', async () => {
    const { result } = await renderIAPBilling();

    expect(result.current.loading).toBe(false);
    expect(result.current.plans).toEqual([plan]);
    expect(result.current.currentSubscriptionItems).toEqual([subscriptionItem]);
    expect(clerk.billing.getPlans).toHaveBeenCalledWith({ for: 'user' });
  });

  describe('purchase on iOS', () => {
    it('requests the apple product mapped to the plan, stamped with the appAccountToken user binding', async () => {
      const { result } = await renderIAPBilling();

      await act(async () => {
        await result.current.purchase(plan, 'month');
      });

      expect(mocks.iap.requestPurchase).toHaveBeenCalledWith({
        request: {
          apple: {
            sku: 'com.acme.pro.monthly',
            appAccountToken: APPLE_APP_ACCOUNT_TOKEN,
          },
        },
        type: 'subs',
      });
    });

    it('registers the JWS payload with Clerk first and finishes the transaction only after success', async () => {
      const { result } = await renderIAPBilling();

      let purchaseResult: any;
      await act(async () => {
        purchaseResult = await result.current.purchase(plan, 'month');
      });

      expect(registerStorePurchase).toHaveBeenCalledTimes(1);
      expect(registerStorePurchase).toHaveBeenCalledWith({ store: 'apple', payload: 'signed.jws.transaction' });
      // Server-first ordering: Clerk registration strictly precedes finishTransaction.
      expect(mocks.callLog).toEqual(['registerStorePurchase', 'finishTransaction']);
      expect(mocks.iap.finishTransaction).toHaveBeenCalledWith({ purchase: applePurchase, isConsumable: false });
      expect(purchaseResult).toEqual({ status: 'success', subscriptionItem });
    });

    it('does not finish the transaction when Clerk rejects the registration', async () => {
      registerStorePurchase.mockRejectedValue(new Error('store_transaction_invalid'));
      const { result } = await renderIAPBilling();

      await act(async () => {
        await expect(result.current.purchase(plan, 'month')).rejects.toThrow('store_transaction_invalid');
      });

      expect(mocks.iap.finishTransaction).not.toHaveBeenCalled();
      expect(getToken).not.toHaveBeenCalled();
    });

    it('refreshes the session token (skipCache) and billing state after a successful registration', async () => {
      const { result } = await renderIAPBilling();
      clerk.billing.getPlans.mockClear();

      await act(async () => {
        await result.current.purchase(plan, 'month');
      });

      expect(getToken).toHaveBeenCalledWith({ skipCache: true });
      expect(clerk.billing.getPlans).toHaveBeenCalledTimes(1);
    });
  });

  describe('purchase on Android', () => {
    beforeEach(() => {
      mocks.Platform.OS = 'android';
    });

    it('requests the google product with the obfuscated account ID user binding and resolved offer token', async () => {
      const { result } = await renderIAPBilling();

      await act(async () => {
        await result.current.purchase(plan, 'month');
      });

      expect(mocks.iap.fetchProducts).toHaveBeenCalledWith({ skus: ['acme_pro_monthly'], type: 'subs' });
      expect(mocks.iap.requestPurchase).toHaveBeenCalledWith({
        request: {
          google: {
            skus: ['acme_pro_monthly'],
            obfuscatedAccountId: GOOGLE_OBFUSCATED_ACCOUNT_ID,
            subscriptionOffers: [{ sku: 'acme_pro_monthly', offerToken: 'offer_token_1' }],
          },
        },
        type: 'subs',
      });
    });

    it('registers the purchase token with Clerk and never finishes (acknowledges) the transaction client-side', async () => {
      const { result } = await renderIAPBilling();

      let purchaseResult: any;
      await act(async () => {
        purchaseResult = await result.current.purchase(plan, 'month');
      });

      expect(registerStorePurchase).toHaveBeenCalledWith({ store: 'google', payload: 'play-purchase-token' });
      // The Clerk backend acknowledges Google purchases; expo-iap's finishTransaction would acknowledge client-side.
      expect(mocks.iap.finishTransaction).not.toHaveBeenCalled();
      expect(purchaseResult).toEqual({ status: 'success', subscriptionItem });
    });
  });

  describe('purchase failure modes', () => {
    it('throws a typed error when the plan has no store product for the platform and period', async () => {
      const { result } = await renderIAPBilling();

      await act(async () => {
        await expect(result.current.purchase(plan, 'annual')).rejects.toMatchObject({
          name: 'IAPBillingError',
          code: 'store_product_not_found',
        });
      });

      expect(mocks.iap.requestPurchase).not.toHaveBeenCalled();
    });

    it('throws a typed error on unsupported platforms', async () => {
      const { result } = await renderIAPBilling();
      mocks.Platform.OS = 'web';

      await act(async () => {
        await result.current.purchase(plan, 'month').then(
          () => expect.unreachable(),
          (error: unknown) => {
            expect(isIAPBillingError(error)).toBe(true);
            expect((error as IAPBillingError).code).toBe('unsupported_platform');
          },
        );
      });
    });

    it('resolves with a cancelled result when the user dismisses the purchase sheet', async () => {
      mocks.iap.requestPurchase.mockImplementation(async () => {
        mocks.emitPurchaseError({ code: 'user-cancelled', message: 'cancelled', productId: 'com.acme.pro.monthly' });
        return null;
      });
      const { result } = await renderIAPBilling();

      let purchaseResult: any;
      await act(async () => {
        purchaseResult = await result.current.purchase(plan, 'month');
      });

      expect(purchaseResult).toEqual({ status: 'cancelled' });
      expect(registerStorePurchase).not.toHaveBeenCalled();
    });

    it('maps the already_subscribed API conflict to a typed result and does not finish the transaction', async () => {
      registerStorePurchase.mockRejectedValue(alreadySubscribedError);
      const { result } = await renderIAPBilling();

      let purchaseResult: any;
      await act(async () => {
        purchaseResult = await result.current.purchase(plan, 'month');
      });

      expect(purchaseResult).toEqual({ status: 'already_subscribed', alreadySubscribedVia: 'stripe' });
      expect(mocks.iap.finishTransaction).not.toHaveBeenCalled();
      expect(getToken).not.toHaveBeenCalled();
    });

    it('wraps unexpected store purchase errors in a typed error', async () => {
      mocks.iap.requestPurchase.mockImplementation(async () => {
        mocks.emitPurchaseError({ code: 'service-error', message: 'Store is down', productId: 'com.acme.pro.monthly' });
        return null;
      });
      const { result } = await renderIAPBilling();

      await act(async () => {
        await expect(result.current.purchase(plan, 'month')).rejects.toMatchObject({
          name: 'IAPBillingError',
          code: 'purchase_failed',
        });
      });
    });
  });

  describe('restorePurchases', () => {
    it('re-registers every available purchase idempotently without finishing/acknowledging transactions', async () => {
      mocks.iap.getAvailablePurchases.mockResolvedValue([applePurchase, googlePurchase]);
      const { result } = await renderIAPBilling();

      let restoreResult: any;
      await act(async () => {
        restoreResult = await result.current.restorePurchases();
      });

      expect(registerStorePurchase).toHaveBeenCalledTimes(2);
      expect(registerStorePurchase).toHaveBeenNthCalledWith(1, { store: 'apple', payload: 'signed.jws.transaction' });
      expect(registerStorePurchase).toHaveBeenNthCalledWith(2, { store: 'google', payload: 'play-purchase-token' });
      // Restored purchases are already-completed transactions: nothing to finish, and the server acknowledges Google.
      expect(mocks.iap.finishTransaction).not.toHaveBeenCalled();
      expect(restoreResult.registered).toEqual([subscriptionItem, subscriptionItem]);
      expect(restoreResult.failed).toEqual([]);
      expect(getToken).toHaveBeenCalledWith({ skipCache: true });
    });

    it('collects registration failures per product and still refreshes for the successful ones', async () => {
      mocks.iap.getAvailablePurchases.mockResolvedValue([
        applePurchase,
        { ...googlePurchase, purchaseToken: null }, // missing payload -> registration cannot be attempted
      ]);
      const { result } = await renderIAPBilling();

      let restoreResult: any;
      await act(async () => {
        restoreResult = await result.current.restorePurchases();
      });

      expect(restoreResult.registered).toEqual([subscriptionItem]);
      expect(restoreResult.failed).toHaveLength(1);
      expect(restoreResult.failed[0].productId).toBe('acme_pro_monthly');
      expect(getToken).toHaveBeenCalledWith({ skipCache: true });
    });

    it('does not refresh the session when nothing was registered', async () => {
      mocks.iap.getAvailablePurchases.mockResolvedValue([]);
      const { result } = await renderIAPBilling();

      await act(async () => {
        await result.current.restorePurchases();
      });

      expect(getToken).not.toHaveBeenCalled();
    });
  });

  describe('out-of-band transactions', () => {
    it('registers purchases delivered outside purchase() (renewals, promo codes) through the same server-first flow', async () => {
      await renderIAPBilling();

      await act(async () => {
        mocks.emitPurchase(applePurchase);
      });

      await waitFor(() => expect(registerStorePurchase).toHaveBeenCalledTimes(1));
      expect(registerStorePurchase).toHaveBeenCalledWith({ store: 'apple', payload: 'signed.jws.transaction' });
      expect(mocks.callLog).toEqual(['registerStorePurchase', 'finishTransaction']);
      expect(getToken).toHaveBeenCalledWith({ skipCache: true });
    });

    it('leaves in-flight purchase() product IDs to the initiating call', async () => {
      // Never emit from requestPurchase: the purchase stays in-flight while the out-of-band event arrives.
      mocks.iap.requestPurchase.mockImplementation(async () => null);
      const { result } = await renderIAPBilling();

      let purchasePromise: Promise<any> | undefined;
      // Start the purchase and flush so its waiter listeners attach and the product ID is marked in-flight.
      await act(async () => {
        purchasePromise = result.current.purchase(plan, 'month');
      });

      await act(async () => {
        // Deliver the event while purchase() is pending: the out-of-band listener must skip it, while the
        // purchase() waiter consumes it.
        mocks.emitPurchase(applePurchase);
        await purchasePromise;
      });

      expect(registerStorePurchase).toHaveBeenCalledTimes(1);
    });
  });
});
