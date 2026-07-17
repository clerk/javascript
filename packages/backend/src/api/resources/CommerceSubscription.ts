import type { BillingMoneyAmount, BillingPerUnitTotal, BillingTotals } from '@clerk/shared/types';

import { billingMoneyAmountFromJSON, billingPerUnitTotalsFromJSON, billingTotalsFromJSON } from '../../util/billing';
import { BillingSubscriptionItem } from './CommerceSubscriptionItem';
import type { BillingSubscriptionJSON } from './JSON';

/**
 * The `BillingSubscription` object is similar to the [`BillingSubscriptionResource`](https://clerk.com/docs/reference/types/billing-subscription-resource) object as it holds information about a subscription, as well as methods for managing it. However, the `BillingSubscription` object is different in that it is used in the [Backend API](https://clerk.com/docs/reference/backend-api/tag/billing/GET/organizations/%7Borganization_id%7D/billing/subscription){{ target: '_blank' }} and is not directly accessible from the Frontend API.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export class BillingSubscription {
  constructor(
    /** The unique identifier for the Subscription. */
    readonly id: string,
    /** The ID of the instance this Subscription belongs to. */
    readonly instanceId: string,
    /** The current status of the Subscription. */
    readonly status: BillingSubscriptionJSON['status'],
    /** The ID of the payer for this Subscription. */
    readonly payerId: string,
    /** The Unix timestamp (milliseconds) of when the Subscription was created. */
    readonly createdAt: number,
    /** The Unix timestamp (milliseconds) of when the Subscription was last updated. */
    readonly updatedAt: number,
    /** The Unix timestamp (milliseconds) of when the Subscription became active. */
    readonly activeAt: number | null,
    /** The Unix timestamp (milliseconds) of when the Subscription became past due. */
    readonly pastDueAt: number | null,
    /** All of the Subscription Items in this Subscription. */
    readonly subscriptionItems: BillingSubscriptionItem[],
    /** Information about the next scheduled payment for this Subscription. */
    readonly nextPayment: {
      /** The Unix timestamp (milliseconds) of when the next payment is scheduled. */
      date: number;
      /** The amount of the next payment. */
      amount: BillingMoneyAmount;
      /** The per-unit cost breakdown for the next payment. */
      perUnitTotals?: BillingPerUnitTotal[];
      /** The full cost breakdown for the next payment. */
      totals?: BillingTotals;
    } | null,
    /** Whether the payer is eligible for a free trial. */
    readonly eligibleForFreeTrial: boolean,
  ) {}

  static fromJSON(data: BillingSubscriptionJSON): BillingSubscription {
    const nextPayment = data.next_payment
      ? {
          date: data.next_payment.date,
          amount: billingMoneyAmountFromJSON(data.next_payment.amount),
          perUnitTotals: data.next_payment.per_unit_totals
            ? billingPerUnitTotalsFromJSON(data.next_payment.per_unit_totals)
            : undefined,
          totals: data.next_payment.totals ? billingTotalsFromJSON(data.next_payment.totals) : undefined,
        }
      : null;

    return new BillingSubscription(
      data.id,
      data.instance_id,
      data.status,
      data.payer_id,
      data.created_at,
      data.updated_at,
      data.active_at ?? null,
      data.past_due_at ?? null,
      (data.subscription_items ?? []).map(item => BillingSubscriptionItem.fromJSON(item)),
      nextPayment,
      data.eligible_for_free_trial ?? false,
    );
  }
}
