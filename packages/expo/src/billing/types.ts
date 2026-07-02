import type {
  BillingPlanResource,
  BillingSubscriptionItemResource,
  BillingSubscriptionPlanPeriod,
} from '@clerk/shared/types';

/**
 * The result of a `purchase()` call. Branch on `status`:
 * - `'success'` — the store purchase completed and was registered with Clerk.
 * - `'cancelled'` — the user dismissed the store purchase sheet.
 * - `'already_subscribed'` — the user already holds an active subscription through another payment processor
 *   (`alreadySubscribedVia`). The store transaction was not registered.
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
   * Purchases the given Plan for the given billing period through the platform app store and registers the purchase
   * with Clerk. Throws an `IAPBillingError` when the purchase cannot be started (for example, when the Plan has no
   * store product mapped for the current platform).
   */
  purchase: (plan: BillingPlanResource, period: BillingSubscriptionPlanPeriod) => Promise<IAPPurchaseResult>;
  /**
   * Enumerates the user's available store purchases and registers each with Clerk. Registration is idempotent, so
   * restoring is safe to run repeatedly (reinstalls, new devices).
   */
  restorePurchases: () => Promise<IAPRestorePurchasesResult>;
  /**
   * Re-fetches the plans and current subscription items.
   */
  refetch: () => Promise<void>;
};
