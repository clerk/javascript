import type { BillingPlanResource, BillingSubscriptionItemResource } from '@clerk/shared/types';

/**
 * The result of a `purchase()` call. Branch on `status`:
 * - `'success'` — the store purchase completed and was registered with Clerk.
 * - `'cancelled'` — the user dismissed the store purchase sheet.
 * - `'already_subscribed'` — the user already holds an active paid subscription (`alreadySubscribedVia`). The store
 *   transaction was not registered. Plan changes for an existing subscription go through the managing processor —
 *   route store-managed subscribers to `manageSubscriptions()`, not a second purchase.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type IAPPurchaseResult =
  | {
      status: 'success';
      /**
       * The subscription item created (or returned, on idempotent replay) by Clerk.
       */
      subscriptionItem: BillingSubscriptionItemResource;
    }
  | {
      status: 'cancelled';
    }
  | {
      status: 'already_subscribed';
      /**
       * The payment processor that manages the user's existing subscription (for example, `'stripe'`).
       */
      alreadySubscribedVia?: string;
    };

/**
 * The result of a `restorePurchases()` call.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type IAPRestorePurchasesResult = {
  /**
   * The subscription items registered (or confirmed, on idempotent replay) with Clerk.
   */
  registered: BillingSubscriptionItemResource[];
  /**
   * Store purchases that could not be registered, with the error that occurred for each.
   */
  failed: { productId: string; error: unknown }[];
};

export type IAPPurchaseOptions = {
  /** Selects a product when the plan has more than one mapping for this store. */
  productId?: string;
  /** Selects an exact Google base plan or one-time purchase option. */
  purchaseOptionId?: string;
  /** Selects an eligible store offer. Omit for RevenueCat-style automatic selection. */
  offerId?: string;
  /** Quantity for consumable products where the store supports multi-quantity purchases. */
  quantity?: number;
  /** Google does not store consumability; the app owns this fulfillment choice. */
  isConsumable?: boolean;
  /** Server-signed Apple promotional offer parameters. */
  appleOffer?: {
    identifier: string;
    keyIdentifier: string;
    nonce: string;
    signature: string;
    timestamp: number;
  };
};

/**
 * The return value of the `useIAPBilling()` hook.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type UseIAPBillingReturn = {
  /**
   * The Billing Plans available to the current user, including their mapped store products (`storeProducts`).
   */
  plans: BillingPlanResource[];
  /**
   * `true` while the plans and current subscription items are being (re)fetched.
   */
  loading: boolean;
  /**
   * The current user's subscription items, including store-managed items (`managedBy`).
   */
  currentSubscriptionItems: BillingSubscriptionItemResource[];
  /**
   * The processor the user's active paid subscription is billed through (`stripe`, `apple` or `google`), or `null`
   * when there is none. When non-null, suppress the purchase affordance: a `purchase()` call would resolve to
   * `{ status: 'already_subscribed' }` without opening the store's payment sheet.
   */
  alreadySubscribedVia: 'stripe' | 'apple' | 'google' | null;
  /**
   * Purchases the given Plan through the platform app store and registers the purchase with Clerk. A plan can map
   * any number of store products per store (each billed on its own store term): with exactly one mapped product no
   * options are needed; with several, name the one to buy via `options.productId` (see `plan.storeProducts`).
   * Throws an `IAPBillingError` when the purchase cannot be started — for example `store_product_not_found` when
   * the Plan has no product mapped for the current platform, or `ambiguous_store_product` when several are mapped
   * and no `productId` was given.
   */
  purchase: (plan: BillingPlanResource, options?: IAPPurchaseOptions) => Promise<IAPPurchaseResult>;
  /**
   * Enumerates the user's available store purchases and registers each with Clerk. Registration is idempotent, so
   * restoring is safe to run repeatedly (reinstalls, new devices).
   */
  restorePurchases: () => Promise<IAPRestorePurchasesResult>;
  /**
   * Opens the platform store's own subscription management surface: the native StoreKit
   * manage-subscriptions sheet on iOS (iOS 15+), or the Google Play subscriptions screen on Android. Falls back to
   * opening the store's subscriptions web URL when the native affordance is unavailable at runtime.
   *
   * This is how apps should handle "cancel my subscription" for store-managed subscription items
   * (`managedBy: 'apple' | 'google'`): store-billed subscriptions can only be cancelled in the store itself — Apple
   * provides no developer API to cancel a subscription on the user's behalf. Cancellations made there flow back to
   * Clerk through the store's server notifications.
   *
   * Throws an `IAPBillingError` with code `'manage_subscriptions_failed'` when the surface cannot be opened.
   */
  manageSubscriptions: () => Promise<void>;
  /**
   * Re-fetches the plans and current subscription items.
   */
  refetch: () => Promise<void>;
};
