import type {
  BillingMoneyAmount,
  BillingSubscriptionItemJSON,
  BillingSubscriptionItemResource,
  BillingSubscriptionJSON,
  BillingSubscriptionPlanPeriod,
  BillingSubscriptionResource,
  BillingSubscriptionStatus,
  CancelSubscriptionParams,
  DeletedObjectJSON,
} from '@clerk/shared/types';

import { unixEpochToDate } from '@/utils/date';

import { billingMoneyAmountFromJSON } from '../../utils';
import { Billing } from '../modules/billing/namespace';
import { BaseResource, BillingPlan, DeletedObject } from './internal';
import { safeInvalidateStableKeys, STABLE_KEYS } from '@clerk/shared/resourceCache';

export class BillingSubscription extends BaseResource implements BillingSubscriptionResource {
  id!: string;
  status!: Extract<BillingSubscriptionStatus, 'active' | 'past_due'>;
  activeAt!: Date;
  createdAt!: Date;
  pastDueAt!: Date | null;
  updatedAt!: Date | null;
  nextPayment?: {
    amount: BillingMoneyAmount;
    date: Date;
  };
  subscriptionItems!: BillingSubscriptionItemResource[];
  eligibleForFreeTrial!: boolean;

  constructor(data: BillingSubscriptionJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: BillingSubscriptionJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.status = data.status;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = data.updated_at ? unixEpochToDate(data.updated_at) : null;
    this.activeAt = unixEpochToDate(data.active_at);
    this.pastDueAt = data.past_due_at ? unixEpochToDate(data.past_due_at) : null;

    if (data.next_payment) {
      this.nextPayment = {
        amount: billingMoneyAmountFromJSON(data.next_payment.amount),
        date: unixEpochToDate(data.next_payment.date),
      };
    }

    this.subscriptionItems = (data.subscription_items || []).map(item => new BillingSubscriptionItem(item));
    this.eligibleForFreeTrial = this.withDefault(data.eligible_for_free_trial, false);
    return this;
  }
}

export class BillingSubscriptionItem extends BaseResource implements BillingSubscriptionItemResource {
  id!: string;
  plan!: BillingPlan;
  planPeriod!: BillingSubscriptionPlanPeriod;
  status!: BillingSubscriptionStatus;
  createdAt!: Date;
  periodStart!: Date;
  periodEnd!: Date | null;
  canceledAt!: Date | null;
  pastDueAt!: Date | null;
  //TODO(@COMMERCE): Why can this be undefined ?
  amount?: BillingMoneyAmount;
  credit?: {
    amount: BillingMoneyAmount;
  };
  isFreeTrial!: boolean;

  constructor(data: BillingSubscriptionItemJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: BillingSubscriptionItemJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.plan = new BillingPlan(data.plan);
    this.planPeriod = data.plan_period;
    this.status = data.status;

    this.createdAt = unixEpochToDate(data.created_at);
    this.pastDueAt = data.past_due_at ? unixEpochToDate(data.past_due_at) : null;

    this.periodStart = unixEpochToDate(data.period_start);
    this.periodEnd = data.period_end ? unixEpochToDate(data.period_end) : null;
    this.canceledAt = data.canceled_at ? unixEpochToDate(data.canceled_at) : null;

    this.amount = data.amount ? billingMoneyAmountFromJSON(data.amount) : undefined;
    this.credit =
      data.credit && data.credit.amount ? { amount: billingMoneyAmountFromJSON(data.credit.amount) } : undefined;

    this.isFreeTrial = this.withDefault(data.is_free_trial, false);
    return this;
  }

  public async cancel(params: CancelSubscriptionParams) {
    const { orgId } = params;
    const json = (
      await BaseResource._fetch({
        path: Billing.path(`/subscription_items/${this.id}`, { orgId }),
        method: 'DELETE',
      })
    )?.response as unknown as DeletedObjectJSON;

    await safeInvalidateStableKeys(BillingSubscriptionItem.clerk?.__internal_queryClient?.client, [
      STABLE_KEYS.SUBSCRIPTION_KEY,
      STABLE_KEYS.STATEMENTS_KEY,
      STABLE_KEYS.PLANS_KEY,
      STABLE_KEYS.PAYMENT_METHODS_KEY,
      STABLE_KEYS.PAYMENT_ATTEMPTS_KEY,
    ]);

    return new DeletedObject(json);
  }
}
