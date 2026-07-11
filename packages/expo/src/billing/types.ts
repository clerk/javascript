import type { BillingPlanResource, BillingSubscriptionItemResource } from '@clerk/shared/types';

/**
 * The result of a `purchase()` call. Branch on `status`:
 * - `'success'` — the store purchase completed and was registered with Clerk. This includes plan changes: when the
 *   user's active subscription is managed by the current platform's store, `purchase()` replaces it with the new
 *   plan instead of creating a second subscription.
 * - `'cancelled'` — the user dismissed the store purchase sheet.
 * - `'already_subscribed'` — the user already holds an active paid subscription billed through a *different*
 *   processor than the current platform's store (`alreadySubscribedVia`: `'stripe'`, or the other platform's
 *   store). The store transaction was not registered. Plan changes for such a subscription go through the managing
 *   processor's own surface, not a purchase on this platform.
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
       * The payment processor that manages the user's existing subscription (for example, `'stripe'`). Always a
       * processor other than the current platform's store — a subscription managed by the current platform's store
       * is changed in place by `purchase()` rather than reported here.
       */
      alreadySubscribedVia?: string;
    };

/**
 * How Google Play bills an Android subscription plan change. Mirrors Google Play Billing's
 * `BillingFlowParams.SubscriptionUpdateParams.ReplacementMode` constants, which `expo-iap` accepts as the
 * corresponding numeric value (in parentheses):
 * - `'charge-prorated-price'` (2) — the new plan starts immediately and the user is charged the prorated price
 *   difference for the remainder of the billing period. Google's recommended default for upgrades, and the default
 *   used by `purchase()`. Only available when the new plan's price per unit of time is higher.
 * - `'with-time-proration'` (1) — the new plan starts immediately; the remaining value already paid is converted
 *   into time on the new plan. Google's recommended default for downgrades and crossgrades.
 * - `'without-proration'` (3) — the new plan starts immediately; the new price is charged on the next billing date,
 *   and the accrued difference is not prorated.
 * - `'charge-full-price'` (5) — the new plan starts immediately and the user is charged its full price; the
 *   remaining value of the old plan is prorated into time (or refunded) per Google's rules.
 * - `'deferred'` (6) — the plan change takes effect when the current billing period ends; until then the user keeps
 *   the old plan.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type IAPAndroidReplacementMode =
  | 'with-time-proration'
  | 'charge-prorated-price'
  | 'without-proration'
  | 'charge-full-price'
  | 'deferred';

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
  /**
   * Android only: how Google Play bills the subscription replacement when `purchase()` performs a plan change
   * (the user's active subscription is already managed by Google Play). Defaults to `'charge-prorated-price'`
   * (immediately charge the prorated price difference — Google's recommended upgrade behavior). Ignored on iOS
   * (StoreKit prorates in-group plan changes natively) and for first-time purchases.
   */
  androidReplacementMode?: IAPAndroidReplacementMode;
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
   * when there is none. When it names a processor *other than the current platform's store*, suppress the purchase
   * affordance: a `purchase()` call would resolve to `{ status: 'already_subscribed' }` without opening the store's
   * payment sheet. When it names the current platform's store, `purchase()` performs a plan change on the existing
   * subscription instead.
   */
  alreadySubscribedVia: 'stripe' | 'apple' | 'google' | null;
  /**
   * Purchases the given Plan through the platform app store and registers the purchase with Clerk. A plan can map
   * any number of store products per store (each billed on its own store term): with exactly one mapped product no
   * options are needed; with several, name the one to buy via `options.productId` (see `plan.storeProducts`).
   *
   * When the user's active paid subscription is already managed by the current platform's store, the purchase is a
   * *plan change* of that subscription, not a second one: on iOS, StoreKit natively replaces and prorates a
   * purchase within the same subscription group; on Android, the SDK passes the active subscription's purchase
   * token with a Google Play replacement mode (default: immediately charge the prorated price difference; override
   * via `options.androidReplacementMode`), and Google Play supersedes the old subscription. The server registers
   * the swap. A subscription managed by any *other* processor (Stripe, or the other platform's store) still
   * resolves to `{ status: 'already_subscribed' }`.
   *
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
