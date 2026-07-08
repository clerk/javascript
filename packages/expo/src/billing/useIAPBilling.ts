import { useClerk } from '@clerk/react';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { BillingPlanResource, BillingStore, BillingSubscriptionItemResource } from '@clerk/shared/types';
import type { Purchase } from 'expo-iap';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';

import { IAPBillingError } from './errors';
import type { ExpoIapModule } from './expoIap';
import { ensureIapConnection, loadExpoIap } from './expoIap';
import type { IAPPurchaseResult, IAPRestorePurchasesResult, UseIAPBillingReturn } from './types';
import {
  deriveAppleAppAccountToken,
  deriveGoogleObfuscatedAccountId,
  extractPurchasePayload,
  findAlreadySubscribedError,
  platformToStore,
  resolveStoreProduct,
} from './utils';

/**
 * Minimum interval between foreground-triggered refetches. The app coming to the foreground refreshes billing state
 * (mirroring the store SDKs), but rapid app-switching should not stampede the API.
 */
const FOREGROUND_REFETCH_MIN_INTERVAL_MS = 15_000;

/**
 * Web fallbacks for the stores' subscription management surfaces, used when the corresponding expo-iap API is
 * missing at runtime (for example, an older expo-iap version).
 */
const APPLE_MANAGE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';
const GOOGLE_MANAGE_SUBSCRIPTIONS_URL = 'https://play.google.com/store/account/subscriptions';

function purchaseStore(purchase: Purchase, fallback: BillingStore): BillingStore {
  return purchase.store === 'apple' || purchase.store === 'google' ? purchase.store : fallback;
}

const USER_CANCELLED_CODES = new Set(['user-cancelled', 'user_cancelled', 'e_user_cancelled']);

/**
 * Whether a purchase error represents the user dismissing the purchase sheet.
 * expo-iap emits a `user-cancelled` code, but on iOS the cancellation often
 * arrives wrapped in Expo's native-call rejection ("Calling the
 * 'requestPurchase' function has failed") with the real cancellation in the
 * `cause` chain — so match known codes AND a cancellation message anywhere in
 * the chain.
 */
function isUserCancelledPurchaseError(error: unknown, depth = 0): boolean {
  if (!error || typeof error !== 'object' || depth > 4) {
    return false;
  }
  const { code, message, cause } = error as { code?: unknown; message?: unknown; cause?: unknown };
  if (typeof code === 'string' && USER_CANCELLED_CODES.has(code.toLowerCase())) {
    return true;
  }
  if (typeof message === 'string' && /cancel(l)?ed/i.test(message)) {
    return true;
  }
  return isUserCancelledPurchaseError(cause, depth + 1);
}

/**
 * The processor an active paid subscription is billed through, in the same vocabulary the backend's
 * cross-processor guard reports (`already_subscribed_via`): Clerk-managed items map to `stripe`,
 * store-managed items to their store. `null` when the user holds no active paid subscription.
 */
function activePaidSubscribedVia(items: BillingSubscriptionItemResource[]): 'stripe' | 'apple' | 'google' | null {
  const active = items.find(item => item.status === 'active' && item.plan && !item.plan.isDefault);
  if (!active) {
    return null;
  }
  return active.managedBy === 'apple' || active.managedBy === 'google' ? active.managedBy : 'stripe';
}

/**
 * Waits for the purchase-updated / purchase-error event for the given product ID. `expo-iap`'s `requestPurchase()`
 * is event-based: the actual outcome is delivered through `purchaseUpdatedListener` / `purchaseErrorListener`, not
 * the returned promise. Listeners must be attached before `requestPurchase()` is called.
 */
function waitForPurchase(iap: ExpoIapModule, productId: string): { promise: Promise<Purchase>; remove: () => void } {
  const subscriptions: { remove: () => void }[] = [];
  const remove = () => subscriptions.forEach(subscription => subscription.remove());

  const promise = new Promise<Purchase>((resolve, reject) => {
    subscriptions.push(
      iap.purchaseUpdatedListener(purchase => {
        if (purchase.productId === productId || purchase.ids?.includes(productId)) {
          resolve(purchase);
        }
      }),
    );
    subscriptions.push(
      iap.purchaseErrorListener(error => {
        // expo-iap's listener PurchaseError carries a single optional productId; errors without one (for example,
        // connection failures) are attributed to the in-flight request.
        if (!error.productId || error.productId === productId) {
          reject(error);
        }
      }),
    );
  });

  // The purchase-error event and `requestPurchase()`'s own rejection can both fire for one failure. When the caller
  // exits through the `requestPurchase()` rejection it never awaits this promise, so mark the duplicate rejection as
  // observed to keep it from surfacing as an unhandled promise rejection.
  promise.catch(() => {});

  return { promise, remove };
}

/**
 * Resolves the Play Billing offer token required to purchase an Android subscription. Falls back to the first
 * available offer for the product; the Clerk store product mapping is per `(plan, period, store)` product ID, so any
 * eligible offer of that product resolves to the same Clerk plan.
 */
async function resolveAndroidOfferToken(iap: ExpoIapModule, productId: string): Promise<string | undefined> {
  const products = await iap.fetchProducts({ skus: [productId], type: 'subs' });
  const androidProduct = (products ?? []).find(
    product => product.id === productId && product.platform === 'android',
  ) as { subscriptionOffers?: { offerTokenAndroid?: string | null }[] | null } | undefined;

  return androidProduct?.subscriptionOffers?.find(offer => !!offer.offerTokenAndroid)?.offerTokenAndroid ?? undefined;
}

/**
 * The `useIAPBilling()` hook provides in-app purchase (Apple App Store / Google Play) billing for Expo apps, backed
 * by Clerk Billing. It requires the optional `expo-iap` module (`npx expo install expo-iap`) and a signed-in user.
 *
 * Purchases follow a server-first flow: the store transaction is registered with Clerk before it is finished. On
 * iOS, the transaction is finished through `expo-iap` after Clerk accepts it. On Android, the transaction is never
 * finished client-side because the Clerk backend acknowledges Google Play purchases (and `expo-iap`'s
 * `finishTransaction()` would acknowledge client-side).
 *
 * @example
 * ```tsx
 * import { useIAPBilling } from '@clerk/expo/experimental';
 *
 * function PaywallScreen() {
 *   const { plans, loading, purchase } = useIAPBilling();
 *
 *   const onSubscribe = async (plan) => {
 *     const result = await purchase(plan, 'month');
 *     if (result.status === 'already_subscribed') {
 *       // The user already subscribed via `result.alreadySubscribedVia` (for example, on the web).
 *     }
 *   };
 *   // ...
 * }
 * ```
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export function useIAPBilling(): UseIAPBillingReturn {
  const clerk = useClerk();
  const [plans, setPlans] = useState<BillingPlanResource[]>([]);
  const [currentSubscriptionItems, setCurrentSubscriptionItems] = useState<BillingSubscriptionItemResource[]>([]);
  const [loading, setLoading] = useState(true);
  /**
   * Product IDs with an in-flight `purchase()` call. The out-of-band purchase listener skips these; the initiating
   * `purchase()` call owns their registration.
   */
  const pendingProductIdsRef = useRef<Set<string>>(new Set());
  /** Timestamp of the last refetch, for throttling foreground-triggered refreshes. */
  const lastRefetchAtRef = useRef(0);
  /** Whether an initial load has completed — subsequent refetches revalidate silently instead of flipping `loading`. */
  const hasLoadedOnceRef = useRef(false);
  /** Mirror of `currentSubscriptionItems` for the purchase() preflight, so the callback never closes over stale state. */
  const currentSubscriptionItemsRef = useRef<BillingSubscriptionItemResource[]>([]);

  clerk.telemetry?.record(eventMethodCalled('useIAPBilling'));

  const userId = clerk.loaded ? clerk.user?.id : undefined;

  const refetch = useCallback(async (): Promise<void> => {
    if (!clerk.loaded || !clerk.user) {
      setPlans([]);
      setCurrentSubscriptionItems([]);
      currentSubscriptionItemsRef.current = [];
      hasLoadedOnceRef.current = false;
      setLoading(false);
      return;
    }

    lastRefetchAtRef.current = Date.now();
    // Stale-while-revalidate: `loading` means "nothing to show yet", never "a refresh is in flight". Background
    // refreshes (foreground return, token-claim changes) update the data silently in place — flipping `loading` on
    // every fetch would blank and re-mount consumer UI on each automatic refresh.
    if (!hasLoadedOnceRef.current) {
      setLoading(true);
    }
    try {
      const [plansResponse, subscription] = await Promise.all([
        clerk.billing.getPlans({ for: 'user' }),
        clerk.billing.getSubscription({}),
      ]);
      setPlans(plansResponse.data);
      setCurrentSubscriptionItems(subscription.subscriptionItems ?? []);
      currentSubscriptionItemsRef.current = subscription.subscriptionItems ?? [];
      hasLoadedOnceRef.current = true;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- userId is intentional: the clerk instance is stable, so refetch must be recreated (re-running the mount effect) when the signed-in user changes.
  }, [clerk, userId]);

  /**
   * Registers a store purchase with Clerk, then finishes the transaction where appropriate (server-first ordering):
   * - iOS: finishing after Clerk accepts the purchase is required so StoreKit stops replaying the transaction.
   * - Android: `finishTransaction()` is intentionally never called. `expo-iap` acknowledges the purchase on Android
   *   (`acknowledgePurchaseAndroid`) with no way to suppress it, and acknowledgment is performed by the Clerk
   *   backend when the purchase is registered.
   */
  const registerWithClerk = useCallback(
    async (
      iap: ExpoIapModule,
      purchase: Purchase,
      store: BillingStore,
      source?: 'purchase' | 'restore',
    ): Promise<BillingSubscriptionItemResource> => {
      const payload = extractPurchasePayload(purchase);
      // `source` is omitted (not sent as `undefined`) so initiated purchases stay wire-identical to older clients;
      // the backend treats an absent `source` as `'purchase'`.
      const subscriptionItem = await clerk.billing.registerStorePurchase({
        store,
        payload,
        ...(source ? { source } : {}),
      });

      if (store === 'apple') {
        await iap.finishTransaction({ purchase, isConsumable: false });
      }

      return subscriptionItem;
    },
    [clerk],
  );

  /**
   * Applies a freshly registered subscription item to local state immediately, so the UI reflects the purchase the
   * moment Clerk confirms it — without waiting for the token refresh + refetch round-trips that follow.
   */
  const applySubscriptionItem = useCallback((item: BillingSubscriptionItemResource): void => {
    setCurrentSubscriptionItems(previous => {
      const others = previous.filter(existing => existing.id !== item.id);
      const next = [...others, item];
      currentSubscriptionItemsRef.current = next;
      return next;
    });
  }, []);

  /**
   * Refreshes the session token so newly granted feature (`fea`) claims are live immediately, and re-fetches the
   * billing state. The two are independent, so they run concurrently: the token refresh flips `has()` entitlements
   * while the refetch reconciles the full subscription list in the background.
   */
  const refreshSessionAndState = useCallback(async (): Promise<void> => {
    await Promise.all([clerk.session?.getToken({ skipCache: true }), refetch()]);
  }, [clerk, refetch]);

  useEffect(() => {
    refetch().catch(() => {
      // Initial fetch errors leave the hook with empty data; callers can retry through `refetch()`.
    });
  }, [refetch]);

  // The session token refresh cycle (~1/min) is already a server signal: when the token's entitlement claims
  // change, billing state changed server-side (purchase, expiry, transfer, a cancellation made in the store's own
  // settings). Use that as a refetch trigger so the subscription display reconciles within one token cycle of any
  // server-side change — no additional polling, and the display can never disagree with `has()` for long.
  const tokenClaims = clerk.session?.lastActiveToken?.jwt?.claims as { fea?: string; pla?: string } | undefined;
  const entitlementFingerprint = `${tokenClaims?.fea ?? ''}|${tokenClaims?.pla ?? ''}`;
  const lastEntitlementFingerprintRef = useRef(entitlementFingerprint);
  useEffect(() => {
    if (lastEntitlementFingerprintRef.current === entitlementFingerprint) {
      return;
    }
    // Deliberately NOT deduped against the foreground-refresh channel: coordinating the two safely costs more
    // correctness risk than the occasional duplicate (idempotent) fetch when both fire within seconds. Each channel
    // stays independently, trivially correct.
    lastEntitlementFingerprintRef.current = entitlementFingerprint;
    refetch().catch(() => {
      // Best-effort; the next explicit refetch surfaces errors.
    });
  }, [entitlementFingerprint, refetch]);

  // Refresh billing state when the app returns to the foreground (mirroring the store SDKs): the server may have
  // moved while backgrounded — renewals, expirations, or a cancellation made in the store's own settings — and the
  // subscription display should reconcile without requiring an explicit user refresh. Throttled so rapid
  // app-switching does not stampede the API.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        return;
      }
      if (Date.now() - lastRefetchAtRef.current < FOREGROUND_REFETCH_MIN_INTERVAL_MS) {
        return;
      }
      refetch().catch(() => {
        // Foreground refreshes are best-effort; the next explicit refetch surfaces errors.
      });
    });
    return () => subscription.remove();
  }, [refetch]);

  // Out-of-band transactions (renewals completed while backgrounded, ask-to-buy approvals, promo-code redemptions)
  // are delivered through `expo-iap`'s purchase-updated listener and registered through the same endpoint.
  useEffect(() => {
    if (!userId) {
      return;
    }

    let iap: ExpoIapModule;
    try {
      iap = loadExpoIap();
    } catch {
      // expo-iap is an optional dependency; skip out-of-band transaction handling when it is not installed.
      return;
    }

    let disposed = false;
    let subscription: { remove: () => void } | undefined;

    const handleOutOfBandPurchase = async (purchase: Purchase) => {
      if (pendingProductIdsRef.current.has(purchase.productId)) {
        return;
      }
      try {
        const store = purchaseStore(purchase, platformToStore(Platform.OS));
        // Out-of-band transactions are store-driven replays, so they register with `source: 'restore'`
        // (transfer-on-restore). For the common case -- a renewal of the current user's own subscription -- the
        // transaction's user binding matches anyway and `source` changes nothing. In the mismatch case (for example,
        // a family-shared Apple ID renews while a different Clerk account is signed in on the device), the store is
        // asserting possession of the subscription exactly as in restorePurchases(), so it transfers to the current
        // user instead of being rejected.
        await registerWithClerk(iap, purchase, store, 'restore');
        await refreshSessionAndState();
      } catch {
        // Registration is idempotent and unfinished transactions are replayed by the store, so a failed attempt is
        // retried on a later event or on restorePurchases().
      }
    };

    ensureIapConnection(iap)
      .then(() => {
        if (disposed) {
          return;
        }
        subscription = iap.purchaseUpdatedListener(purchase => void handleOutOfBandPurchase(purchase));
      })
      .catch(() => {
        // The store billing connection is unavailable; purchase() will surface the connection error when used.
      });

    return () => {
      disposed = true;
      subscription?.remove();
    };
  }, [userId, registerWithClerk, refreshSessionAndState]);

  const purchase = useCallback(
    async (plan: BillingPlanResource, options?: { productId?: string }): Promise<IAPPurchaseResult> => {
      const store = platformToStore(Platform.OS);
      const product = resolveStoreProduct(plan, store, options?.productId);

      const purchaserId = clerk.user?.id;
      if (!purchaserId) {
        throw new IAPBillingError('user_unavailable', 'A signed-in user is required to make an in-app purchase.');
      }

      // Preflight against already-loaded state: an active paid subscription through any processor
      // would be rejected by the backend's cross-processor guard AFTER the store charged the user,
      // so fail before the payment sheet ever opens. Zero latency (no network); the backend guard
      // remains the source of truth for races this state can't see.
      const preflightVia = activePaidSubscribedVia(currentSubscriptionItemsRef.current);
      if (preflightVia) {
        return { status: 'already_subscribed', alreadySubscribedVia: preflightVia };
      }

      const iap = loadExpoIap();
      await ensureIapConnection(iap);

      pendingProductIdsRef.current.add(product.productId);
      const waiter = waitForPurchase(iap, product.productId);

      try {
        let storePurchase: Purchase;
        try {
          if (store === 'apple') {
            await iap.requestPurchase({
              request: {
                apple: {
                  sku: product.productId,
                  // Binds the store transaction to the Clerk user; the backend cross-checks it on registration.
                  appAccountToken: await deriveAppleAppAccountToken(purchaserId),
                },
              },
              type: 'subs',
            });
          } else {
            const offerToken = await resolveAndroidOfferToken(iap, product.productId);
            await iap.requestPurchase({
              request: {
                google: {
                  skus: [product.productId],
                  // Binds the store transaction to the Clerk user; the backend cross-checks it on registration.
                  obfuscatedAccountId: await deriveGoogleObfuscatedAccountId(purchaserId),
                  ...(offerToken ? { subscriptionOffers: [{ sku: product.productId, offerToken }] } : {}),
                },
              },
              type: 'subs',
            });
          }

          storePurchase = await waiter.promise;
        } catch (error) {
          if (isUserCancelledPurchaseError(error)) {
            return { status: 'cancelled' };
          }
          if (error instanceof IAPBillingError) {
            throw error;
          }
          const message =
            error instanceof Error
              ? error.message
              : ((error as { message?: string } | null)?.message ?? 'Unknown error');
          throw new IAPBillingError('purchase_failed', `The ${store} store purchase failed: ${message}`, {
            cause: error,
          });
        }

        let subscriptionItem: BillingSubscriptionItemResource;
        try {
          // Server-first: the purchase is registered with Clerk before the transaction is finished.
          subscriptionItem = await registerWithClerk(iap, storePurchase, store);
        } catch (error) {
          const alreadySubscribed = findAlreadySubscribedError(error);
          if (alreadySubscribed) {
            return { status: 'already_subscribed', alreadySubscribedVia: alreadySubscribed.alreadySubscribedVia };
          }
          throw error;
        }

        // The registration response IS the new subscription item — reflect it immediately rather than making the
        // UI wait for the token refresh + refetch round-trips below.
        applySubscriptionItem(subscriptionItem);
        await refreshSessionAndState();

        return { status: 'success', subscriptionItem };
      } finally {
        waiter.remove();
        pendingProductIdsRef.current.delete(product.productId);
      }
    },
    [clerk, registerWithClerk, applySubscriptionItem, refreshSessionAndState],
  );

  const restorePurchases = useCallback(async (): Promise<IAPRestorePurchasesResult> => {
    const fallbackStore = platformToStore(Platform.OS);

    const iap = loadExpoIap();
    await ensureIapConnection(iap);

    const availablePurchases = await iap.getAvailablePurchases();
    const registered: BillingSubscriptionItemResource[] = [];
    const failed: { productId: string; error: unknown }[] = [];

    for (const availablePurchase of availablePurchases) {
      try {
        const payload = extractPurchasePayload(availablePurchase);
        // Registration is idempotent by store transaction lineage: replays resolve with the current item. Restored
        // purchases are already-completed transactions, so they are intentionally not finished/acknowledged here.
        // `source: 'restore'` transfers a subscription bound to a different user to the current user
        // (transfer-on-restore) instead of rejecting the registration.
        registered.push(
          await clerk.billing.registerStorePurchase({
            store: purchaseStore(availablePurchase, fallbackStore),
            payload,
            source: 'restore',
          }),
        );
      } catch (error) {
        failed.push({ productId: availablePurchase.productId, error });
      }
    }

    // Refresh even when nothing was registered: tapping "restore" expresses "sync my subscription state" — the
    // server may have moved (renewal, expiry, transfer-away) since the last fetch, and this is the user's explicit
    // ask to reconcile the display with reality.
    await refreshSessionAndState();

    return { registered, failed };
  }, [clerk, refreshSessionAndState]);

  /**
   * Routes "cancel/manage my subscription" intent to the store's own surface. Store-managed subscriptions can only
   * be cancelled in the store (Apple provides no developer API to cancel on the user's behalf), so the best an app
   * can do — and what the stores expect — is to open the store's subscription management UI:
   * - iOS: `expo-iap`'s `showManageSubscriptionsIOS()` presents StoreKit's native manage-subscriptions sheet
   *   (iOS 15+).
   * - Android: `expo-iap`'s `deepLinkToSubscriptions()` opens the Google Play subscriptions screen (the native
   *   module targets the current app's package).
   * When the expo-iap API is missing at runtime, the store's subscriptions web URL is opened instead.
   */
  const manageSubscriptions = useCallback(async (): Promise<void> => {
    const store = platformToStore(Platform.OS);

    let iap: ExpoIapModule | undefined;
    try {
      iap = loadExpoIap();
    } catch {
      // expo-iap is an optional dependency; fall back to the store's subscriptions web URL below.
    }

    try {
      if (store === 'apple') {
        if (iap && typeof iap.showManageSubscriptionsIOS === 'function') {
          await ensureIapConnection(iap);
          // Resolves when the user dismisses the sheet; status changes are delivered as out-of-band events.
          await iap.showManageSubscriptionsIOS();
        } else {
          await Linking.openURL(APPLE_MANAGE_SUBSCRIPTIONS_URL);
        }
        return;
      }

      if (iap && typeof iap.deepLinkToSubscriptions === 'function') {
        await ensureIapConnection(iap);
        await iap.deepLinkToSubscriptions();
      } else {
        await Linking.openURL(GOOGLE_MANAGE_SUBSCRIPTIONS_URL);
      }
    } catch (error) {
      if (error instanceof IAPBillingError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new IAPBillingError(
        'manage_subscriptions_failed',
        `Unable to open the ${store} subscription management surface: ${message}`,
        { cause: error },
      );
    }
  }, []);

  return {
    plans,
    loading,
    currentSubscriptionItems,
    alreadySubscribedVia: activePaidSubscribedVia(currentSubscriptionItems),
    purchase,
    restorePurchases,
    manageSubscriptions,
    refetch,
  };
}
