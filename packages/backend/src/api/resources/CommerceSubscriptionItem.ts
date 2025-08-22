import type { CommerceMoneyAmountJSON } from '@clerk/types';

import { type CommerceMoneyAmount, CommercePlan } from './CommercePlan';
import type { CommerceSubscriptionItemJSON } from './JSON';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version to avoid breaking changes.
 */
export class CommerceSubscriptionItem {
  constructor(
    /**
     * The unique identifier for the subscription item.
     */
    readonly id: string,
    /**
     * The status of the subscription item.
     */
    readonly status: CommerceSubscriptionItemJSON['status'],
    /**
     * The plan period for the subscription item.
     */
    readonly planPeriod: 'month' | 'annual',
    /**
     * The start of the current period.
     */
    readonly periodStart: number,
    /**
     * The next payment information.
     */
    readonly nextPayment: {
      amount: number;
      date: number;
    } | null,
    /**
     * The current amount for the subscription item.
     */
    readonly amount: CommerceMoneyAmount | null | undefined,
    /**
     * The plan associated with this subscription item.
     */
    readonly plan: CommercePlan,
    /**
     * The plan ID.
     */
    readonly planId: string,
    /**
     * The end of the current period.
     */
    readonly periodEnd?: number,
    /**
     * When the subscription item was canceled.
     */
    readonly canceledAt?: number,
    /**
     * When the subscription item became past due.
     */
    readonly pastDueAt?: number,
    /**
     * The lifetime amount paid for this subscription item.
     */
    readonly lifetimePaid?: CommerceMoneyAmount | null,
  ) {}

  static fromJSON(data: CommerceSubscriptionItemJSON): CommerceSubscriptionItem {
    console.log('data', data);

    function formatAmountJSON(amount: null): null;
    function formatAmountJSON(amount: undefined): undefined;
    function formatAmountJSON(amount: CommerceMoneyAmountJSON): CommerceMoneyAmount;
    function formatAmountJSON(
      amount: CommerceMoneyAmountJSON | null | undefined,
    ): CommerceMoneyAmount | null | undefined;
    function formatAmountJSON(
      amount: CommerceMoneyAmountJSON | null | undefined,
    ): CommerceMoneyAmount | null | undefined {
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

    return new CommerceSubscriptionItem(
      data.id,
      data.status,
      data.plan_period,
      data.period_start,
      data.next_payment,
      formatAmountJSON(data.amount),
      CommercePlan.fromJSON(data.plan),
      data.plan_id,
      data.period_end,
      data.canceled_at,
      data.past_due_at,
      formatAmountJSON(data.lifetime_paid),
    );
  }
}
