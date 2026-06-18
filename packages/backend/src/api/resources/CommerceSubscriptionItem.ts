import type { BillingMoneyAmount, BillingMoneyAmountJSON } from '@clerk/shared/types';

import { BillingPlan } from './CommercePlan';
import type { BillingSubscriptionItemJSON } from './JSON';

/**
 * The `BillingSubscriptionItem` object is similar to the [`BillingSubscriptionItemResource`](https://clerk.com/docs/reference/types/billing-subscription-item-resource) object as it holds information about a subscription item, as well as methods for managing it. However, the `BillingSubscriptionItem` object is different in that it is used in the [Backend API](https://clerk.com/docs/reference/backend-api/tag/billing/GET/billing/subscription_items){{ target: '_blank' }} and is not directly accessible from the Frontend API.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export class BillingSubscriptionItem {
  constructor(
    /**
     * The unique identifier for the Subscription Item.
     */
    readonly id: string,
    /**
     * The status of the Subscription Item.
     */
    readonly status: BillingSubscriptionItemJSON['status'],
    /**
     * The period of the Plan associated with this Subscription Item.
     */
    readonly planPeriod: 'month' | 'annual',
    /**
     * The Unix timestamp (milliseconds) of when the current period starts.
     */
    readonly periodStart: number,
    /**
     * Information about the next scheduled payment for this Subscription Item. If present, contains the amount of the next payment and the Unix timestamp (milliseconds) of when the next payment is scheduled.
     */
    readonly nextPayment:
      | {
          /**
           * The amount of the next payment.
           */
          amount: number;
          /**
           * The Unix timestamp (milliseconds) of when the next payment is scheduled.
           */
          date: number;
        }
      | null
      | undefined,
    /**
     * The current amount for the Subscription Item.
     */
    readonly amount: BillingMoneyAmount | undefined,
    /**
     * The Plan associated with this Subscription Item.
     */
    readonly plan: BillingPlan | null,
    /**
     * The ID of the Plan associated with this Subscription Item.
     */
    readonly planId: string | null,
    /**
     * The Unix timestamp (milliseconds) of when the Subscription Item was created.
     */
    readonly createdAt: number,
    /**
     * The Unix timestamp (milliseconds) of when the Subscription Item was last updated.
     */
    readonly updatedAt: number,
    /**
     * The Unix timestamp (milliseconds) of when the current period ends.
     */
    readonly periodEnd: number | null,
    /**
     * The Unix timestamp (milliseconds) of when the Subscription Item was canceled.
     */
    readonly canceledAt: number | null,
    /**
     * The Unix timestamp (milliseconds) of when the Subscription Item became past due.
     */
    readonly pastDueAt: number | null,
    /**
     * The Unix timestamp (milliseconds) of when the Subscription Item ended.
     */
    readonly endedAt: number | null,
    /**
     * The ID of the payer for this Subscription Item.
     */
    readonly payerId: string | undefined,
    /**
     * Whether this Subscription Item is currently in a free trial period.
     */
    readonly isFreeTrial?: boolean,
    /**
     * The lifetime amount paid for this Subscription Item.
     */
    readonly lifetimePaid?: BillingMoneyAmount,
  ) {}

  static fromJSON(data: BillingSubscriptionItemJSON): BillingSubscriptionItem {
    function formatAmountJSON(
      amount: BillingMoneyAmountJSON | null | undefined,
    ): BillingMoneyAmount | null | undefined {
      if (!amount) {
        return amount;
      }

      return {
        amount: amount.amount,
        amountFormatted: amount.amount_formatted,
        currency: amount.currency,
        currencySymbol: amount.currency_symbol,
      };
    }

    return new BillingSubscriptionItem(
      data.id,
      data.status,
      data.plan_period,
      data.period_start,
      data.next_payment,
      formatAmountJSON(data.amount) ?? undefined,
      data.plan ? BillingPlan.fromJSON(data.plan) : null,
      data.plan_id ?? null,
      data.created_at,
      data.updated_at,
      data.period_end,
      data.canceled_at,
      data.past_due_at,
      data.ended_at,
      data.payer_id,
      data.is_free_trial,
      formatAmountJSON(data.lifetime_paid) ?? undefined,
    );
  }
}
