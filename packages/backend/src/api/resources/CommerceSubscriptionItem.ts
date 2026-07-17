import type {
  BillingMoneyAmount,
  BillingPerUnitTotal,
  BillingSubscriptionItemSeats,
  BillingTotals,
} from '@clerk/shared/types';

import { BillingPlan } from './CommercePlan';
import {
  billingMoneyAmountFromJSON,
  billingPerUnitTotalsFromJSON,
  billingSubscriptionItemSeatsFromJSON,
  billingTotalsFromJSON,
} from '../../util/billing';
import type { BillingSubscriptionItemJSON } from './JSON';

/**
 * The `BillingSubscriptionItem` object is similar to the [`BillingSubscriptionItemResource`](https://clerk.com/docs/reference/types/billing-subscription-item-resource) object as it holds information about a subscription item, as well as methods for managing it. However, the `BillingSubscriptionItem` object is different in that it is used in the [Backend API](https://clerk.com/docs/reference/backend-api/tag/billing/GET/billing/subscription_items){{ target: '_blank' }} and is not directly accessible from the Frontend API.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export class BillingSubscriptionItem {
  constructor(
    /** The unique identifier for the Subscription Item. */
    readonly id: string,
    /** The ID of the instance this Subscription Item belongs to. */
    readonly instanceId: string,
    /** The status of the Subscription Item. */
    readonly status: BillingSubscriptionItemJSON['status'],
    /** The period of the Plan associated with this Subscription Item. */
    readonly planPeriod: 'month' | 'annual',
    /** The Unix timestamp (milliseconds) of when the current period starts. */
    readonly periodStart: number,
    /** Information about the next scheduled payment for this Subscription Item. */
    readonly nextPayment:
      | {
          /** The amount of the next payment. */
          amount: BillingMoneyAmount;
          /** The Unix timestamp (milliseconds) of when the next payment is scheduled. */
          date: number;
          /** The per-unit cost breakdown for the next payment. */
          perUnitTotals?: BillingPerUnitTotal[];
          /** The full cost breakdown for the next payment. */
          totals?: BillingTotals;
        }
      | null
      | undefined,
    /** The current amount for the Subscription Item. */
    readonly amount: BillingMoneyAmount | undefined,
    /** The Plan associated with this Subscription Item. */
    readonly plan: BillingPlan | null,
    /** The ID of the Plan associated with this Subscription Item. */
    readonly planId: string | null,
    /** The ID of the price associated with this Subscription Item. */
    readonly priceId: string | null,
    /** The Unix timestamp (milliseconds) of when the Subscription Item was created. */
    readonly createdAt: number,
    /** The Unix timestamp (milliseconds) of when the Subscription Item was last updated. */
    readonly updatedAt: number,
    /** The Unix timestamp (milliseconds) of when the current period ends. */
    readonly periodEnd: number | null,
    /** The Unix timestamp (milliseconds) of when the Subscription Item was canceled. */
    readonly canceledAt: number | null,
    /** The Unix timestamp (milliseconds) of when the Subscription Item became past due. */
    readonly pastDueAt: number | null,
    /** The Unix timestamp (milliseconds) of when the Subscription Item ended. */
    readonly endedAt: number | null,
    /** The ID of the payer for this Subscription Item. */
    readonly payerId: string | undefined,
    /** Whether this Subscription Item is currently in a free trial period. */
    readonly isFreeTrial: boolean,
    /** The lifetime amount paid for this Subscription Item. */
    readonly lifetimePaid?: BillingMoneyAmount,
    /** Seat entitlement details for organization subscription items with seat-based billing. */
    readonly seats?: BillingSubscriptionItemSeats,
  ) {}

  static fromJSON(data: BillingSubscriptionItemJSON): BillingSubscriptionItem {
    const nextPayment = data.next_payment
      ? {
          amount: billingMoneyAmountFromJSON(data.next_payment.amount),
          date: data.next_payment.date,
          perUnitTotals: data.next_payment.per_unit_totals
            ? billingPerUnitTotalsFromJSON(data.next_payment.per_unit_totals)
            : undefined,
          totals: data.next_payment.totals ? billingTotalsFromJSON(data.next_payment.totals) : undefined,
        }
      : data.next_payment;

    return new BillingSubscriptionItem(
      data.id,
      data.instance_id,
      data.status,
      data.plan_period,
      data.period_start,
      nextPayment,
      data.amount ? billingMoneyAmountFromJSON(data.amount) : undefined,
      data.plan ? BillingPlan.fromJSON(data.plan) : null,
      data.plan_id ?? null,
      data.price_id ?? null,
      data.created_at,
      data.updated_at,
      data.period_end,
      data.canceled_at,
      data.past_due_at,
      data.ended_at,
      data.payer_id,
      data.is_free_trial,
      data.lifetime_paid ? billingMoneyAmountFromJSON(data.lifetime_paid) : undefined,
      data.seats ? billingSubscriptionItemSeatsFromJSON(data.seats) : undefined,
    );
  }
}
