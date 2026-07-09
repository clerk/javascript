import { useClerk } from '@clerk/react';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { BillingPlanResource, BillingStore, BillingSubscriptionItemResource } from '@clerk/shared/types';
import type { DiscountOffer, ProductOrSubscription, Purchase, SubscriptionOffer } from 'expo-iap';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';

import { IAPBillingError } from './errors';
import type { ExpoIapModule } from './expoIap';
import { ensureIapConnection, loadExpoIap } from './expoIap';
import type { IAPPurchaseOptions, IAPPurchaseResult, IAPRestorePurchasesResult, UseIAPBillingReturn } from './types';
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

/** Fetches the product exactly as the store currently exposes it. */
async function fetchStoreProduct(iap: ExpoIapModule, productId: string): Promise<ProductOrSubscription> {
  const products = await iap.fetchProducts({ skus: [productId], type: 'all' });
  const product = (products ?? []).find(candidate => candidate.id === productId);
  if (!product) {
    throw new IAPBillingError('store_product_not_found', `The store did not return product "${productId}".`);
  }
  return product;
}

function isoPeriodDays(period: string): number {
  const match = /^P(?:(\d+)D)?(?:(\d+)W)?(?:(\d+)M)?(?:(\d+)Y)?$/.exec(period);
  if (!match) {
    return 0;
  }
  return Number(match[1] || 0) + Number(match[2] || 0) * 7 + Number(match[3] || 0) * 30 + Number(match[4] || 0) * 365;
}

function freeTrialDays(offer: SubscriptionOffer): number {
  return (offer.pricingPhasesAndroid?.pricingPhaseList ?? []).reduce((days, phase) => {
    if (Number(phase.priceAmountMicros) !== 0) {
      return days;
    }
    return days + isoPeriodDays(phase.billingPeriod) * Math.max(phase.billingCycleCount, 1);
  }, 0);
}

function introductoryPriceMicros(offer: SubscriptionOffer): number | undefined {
  const phases = offer.pricingPhasesAndroid?.pricingPhaseList ?? [];
  if (phases.length < 2) {
    return undefined;
  }
  return Number(phases[0]?.priceAmountMicros);
}

/** RevenueCat-style automatic selection: longest trial, cheapest intro, then base plan. */
function resolveAndroidSubscriptionOffer(
  offers: SubscriptionOffer[],
  basePlanId: string,
  offerId?: string,
): SubscriptionOffer {
  const eligible = offers.filter(offer => offer.basePlanIdAndroid === basePlanId && offer.offerTokenAndroid);
  if (offerId) {
    const exact = eligible.find(offer => offer.id === offerId);
    if (!exact) {
      throw new IAPBillingError(
        'offer_not_available',
        `Google Play did not return offer "${offerId}" for base plan "${basePlanId}". The user may not be eligible.`,
      );
    }
    return exact;
  }
  const trial = [...eligible]
    .sort((a, b) => freeTrialDays(b) - freeTrialDays(a))
    .find(offer => freeTrialDays(offer) > 0);
  if (trial) {
    return trial;
  }
  const introductory = eligible
    .map(offer => ({ offer, price: introductoryPriceMicros(offer) }))
    .filter((entry): entry is { offer: SubscriptionOffer; price: number } => entry.price !== undefined)
    .sort((a, b) => a.price - b.price)[0]?.offer;
  if (introductory) {
    return introductory;
  }
  const basePlan = eligible.find(offer => !offer.id) ?? eligible[0];
  if (!basePlan) {
    throw new IAPBillingError(
      'offer_not_available',
      `Google Play did not return an eligible offer token for base plan "${basePlanId}".`,
    );
  }
  return basePlan;
}

function resolveAndroidOneTimeOffer(
  offers: DiscountOffer[],
  purchaseOptionId: string,
  offerId?: string,
): DiscountOffer {
  const eligible = offers.filter(
    offer => offer.purchaseOptionIdAndroid === purchaseOptionId && offer.offerTokenAndroid,
  );
  if (offerId) {
    const exact = eligible.find(offer => offer.id === offerId);
    if (!exact) {
      throw new IAPBillingError(
        'offer_not_available',
        `Google Play did not return offer "${offerId}" for purchase option "${purchaseOptionId}".`,
      );
    }
    return exact;
  }
  const baseOffer = eligible.find(offer => !offer.id);
  const selected = baseOffer ?? [...eligible].sort((a, b) => a.price - b.price)[0];
  if (!selected) {
    throw new IAPBillingError(
      'offer_not_available',
      `Google Play did not return an eligible offer token for purchase option "${purchaseOptionId}".`,
    );
  }
  return selected;
}

/**
 * The `useIAPBilling()` hook provides in-app purchase (Apple App Store / Google Play) billing for Expo apps, backed
 * by Clerk Billing. It requires the optional `expo-iap` module (`npx expo install expo-iap`) and a signed-in user.
 *
 * Purchases follow a server-first flow: the store transaction is registered with Clerk before it is finished. On
 * iOS, the transaction is finished through `expo-iap` after Clerk accepts it. Clerk acknowledges Google Play
 * subscriptions server-side; one-time Google Play products are consumed or acknowledged through `expo-iap` only
 * after Clerk accepts the purchase.
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
   * - Android subscriptions: Clerk acknowledges the purchase server-side, so the SDK must not acknowledge it first.
   * - Android one-time products: `expo-iap` consumes or acknowledges the purchase after Clerk accepts it.
   */
  const registerWithClerk = useCallback(
    async (
      iap: ExpoIapModule,
      purchase: Purchase,
      store: BillingStore,
      source?: 'purchase' | 'restore' | 'sync',
      finish?: { isConsumable: boolean; onAndroid: boolean },
    ): Promise<BillingSubscriptionItemResource> => {
      const payload = extractPurchasePayload(purchase);
      // `source` is omitted (not sent as `undefined`) so initiated purchases stay wire-identical to older clients;
      // the backend treats an absent `source` as `'purchase'`.
      const subscriptionItem = await clerk.billing.registerStorePurchase({
        store,
        payload,
        ...(source ? { source } : {}),
      });

      if (store === 'apple' || finish?.onAndroid) {
        await iap.finishTransaction({ purchase, isConsumable: finish?.isConsumable ?? false });
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
        // Passive listener delivery is synchronization, not a customer-initiated restore. It must never opt into
        // transfer-on-restore (especially for Apple Family Sharing transactions).
        await registerWithClerk(iap, purchase, store, 'sync');
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
    async (plan: BillingPlanResource, options?: IAPPurchaseOptions): Promise<IAPPurchaseResult> => {
      const store = platformToStore(Platform.OS);
      const product = resolveStoreProduct(plan, store, options?.productId, options?.purchaseOptionId);

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
      const storeProduct = await fetchStoreProduct(iap, product.productId);
      const appleProductType =
        storeProduct.platform === 'ios' && 'typeIOS' in storeProduct ? storeProduct.typeIOS : undefined;
      const isSubscription = storeProduct.type === 'subs' || appleProductType === 'auto-renewable-subscription';
      const isConsumable = store === 'apple' ? appleProductType === 'consumable' : options?.isConsumable === true;

      // The catalog is intentionally generic, but the current Clerk endpoint returns a subscription item and only
      // has subscription entitlement semantics. Never charge a one-time/non-renewing product and discover that
      // mismatch during server registration. Supporting these product types requires a generic purchase ledger and
      // an explicit fulfillment model (including the app-owned consumability decision for Google one-time products).
      if (!isSubscription) {
        throw new IAPBillingError(
          'unsupported_product_type',
          `Clerk can display ${store} product "${product.productId}", but purchases currently support auto-renewing subscriptions only.`,
        );
      }

      // Ask Clerk after the exact live store product has been resolved, immediately before opening the payment
      // sheet. This catches stale local billing state, missing mappings, and invalid store connections before the
      // user can be charged; Create still verifies the final store transaction authoritatively.
      try {
        await clerk.billing.preflightStorePurchase({
          store,
          productId: product.productId,
          purchaseOptionId: product.purchaseOptionId,
        });
      } catch (error) {
        const alreadySubscribed = findAlreadySubscribedError(error);
        if (alreadySubscribed) {
          return { status: 'already_subscribed', alreadySubscribedVia: alreadySubscribed.alreadySubscribedVia };
        }
        throw error;
      }

      pendingProductIdsRef.current.add(product.productId);
      const waiter = waitForPurchase(iap, product.productId);

      try {
        let storePurchase: Purchase;
        try {
          if (store === 'apple') {
            if (options?.offerId && !options.appleOffer) {
              throw new IAPBillingError(
                'offer_signature_required',
                `Apple promotional offer "${options.offerId}" requires fresh server-signed offer parameters.`,
              );
            }
            if (options?.appleOffer && options.offerId && options.appleOffer.identifier !== options.offerId) {
              throw new IAPBillingError(
                'offer_not_available',
                `The signed Apple offer identifier does not match requested offer "${options.offerId}".`,
              );
            }
            const appleRequest = {
              sku: product.productId,
              // Binds the store transaction to the Clerk user; the backend cross-checks it on registration.
              appAccountToken: await deriveAppleAppAccountToken(purchaserId),
              ...(options?.appleOffer ? { withOffer: options.appleOffer } : {}),
            };
            if (isSubscription) {
              await iap.requestPurchase({ request: { apple: appleRequest }, type: 'subs' });
            } else {
              await iap.requestPurchase({
                request: {
                  apple: {
                    ...appleRequest,
                    ...(options?.quantity ? { quantity: options.quantity } : {}),
                  },
                },
                type: 'in-app',
              });
            }
          } else {
            const purchaseOptionId = product.purchaseOptionId;
            if (!purchaseOptionId) {
              throw new IAPBillingError(
                'store_product_not_found',
                `Google product "${product.productId}" is missing its mapped base plan or purchase option ID.`,
              );
            }
            const googleAccountId = await deriveGoogleObfuscatedAccountId(purchaserId);
            if (isSubscription) {
              const androidProduct = storeProduct as ProductOrSubscription & {
                subscriptionOffers?: SubscriptionOffer[] | null;
              };
              const offer = resolveAndroidSubscriptionOffer(
                androidProduct.subscriptionOffers ?? [],
                purchaseOptionId,
                options?.offerId,
              );
              await iap.requestPurchase({
                request: {
                  google: {
                    skus: [product.productId],
                    obfuscatedAccountId: googleAccountId,
                    subscriptionOffers: [{ sku: product.productId, offerToken: offer.offerTokenAndroid as string }],
                  },
                },
                type: 'subs',
              });
            } else {
              const androidProduct = storeProduct as ProductOrSubscription & {
                discountOffers?: DiscountOffer[] | null;
              };
              const offer = resolveAndroidOneTimeOffer(
                androidProduct.discountOffers ?? [],
                purchaseOptionId,
                options?.offerId,
              );
              await iap.requestPurchase({
                request: {
                  google: {
                    skus: [product.productId],
                    obfuscatedAccountId: googleAccountId,
                    offerToken: offer.offerTokenAndroid,
                  },
                },
                type: 'in-app',
              });
            }
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
          subscriptionItem = await registerWithClerk(iap, storePurchase, store, undefined, {
            isConsumable,
            onAndroid: store === 'google' && !isSubscription,
          });
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
