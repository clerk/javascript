import type { BillingSubscriptionItemResource } from '@clerk/shared/types';

/**
 * Returns `true` when a subscription item exposes at least one management
 * action to the user (switch period, cancel, or re-subscribe).
 *
 * The only subscription a user cannot act on is the one backed by the
 * instance's default plan, because every user is implicitly subscribed to it
 * and cannot opt out.
 *
 * Intentionally not based on `plan.hasBaseFee`: a plan can have no base fee
 * and still be a real paid subscription (e.g seat-based billing where the
 * cost is driven entirely by a seat unit price).
 */
export const isManageableSubscriptionItem = (subscriptionItem: BillingSubscriptionItemResource): boolean =>
  !subscriptionItem.plan.isDefault;
