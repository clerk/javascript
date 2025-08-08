import type {
  CancelSubscriptionParams,
  CommerceFee,
  CommerceSubscriptionItemJSON,
  CommerceSubscriptionItemResource,
  CommerceSubscriptionJSON,
  CommerceSubscriptionPlanPeriod,
  CommerceSubscriptionResource,
  CommerceSubscriptionStatus,
  DeletedObjectJSON,
} from '@clerk/types';

import { unixEpochToDate } from '@/utils/date';

import { commerceFeeFromJSON } from '../../utils';
import { BaseResource, CommercePlan, DeletedObject } from './internal';

export class CommerceSubscription extends BaseResource implements CommerceSubscriptionResource {
  id!: string;
  status!: Extract<CommerceSubscriptionStatus, 'active' | 'past_due'>;
  activeAt!: Date;
  createdAt!: Date;
  pastDueAt!: Date | null;
  updatedAt!: Date | null;
  nextPayment: {
    amount: CommerceFee;
    date: Date;
  } | null = null;
  subscriptionItems!: CommerceSubscriptionItemResource[];

  constructor(data: CommerceSubscriptionJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceSubscriptionJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.status = data.status;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = data.updated_at ? unixEpochToDate(data.updated_at) : null;
    this.activeAt = unixEpochToDate(data.active_at);
    this.pastDueAt = data.past_due_at ? unixEpochToDate(data.past_due_at) : null;
    this.nextPayment = data.next_payment
      ? {
          amount: commerceFeeFromJSON(data.next_payment.amount),
          date: unixEpochToDate(data.next_payment.date),
        }
      : null;
    this.subscriptionItems = (data.subscription_items || []).map(item => new CommerceSubscriptionItem(item));
    return this;
  }
}

export class CommerceSubscriptionItem extends BaseResource implements CommerceSubscriptionItemResource {
  id!: string;
  paymentSourceId!: string;
  plan!: CommercePlan;
  planPeriod!: CommerceSubscriptionPlanPeriod;
  status!: CommerceSubscriptionStatus;
  createdAt!: Date;
  pastDueAt!: Date | null;
  periodStartDate!: Date;
  periodEndDate!: Date | null;
  canceledAtDate!: Date | null;
  periodStart!: number;
  periodEnd!: number;
  canceledAt!: number | null;
  //TODO(@COMMERCE): Why can this be undefined ?
  amount?: CommerceFee;
  credit?: {
    amount: CommerceFee;
  };

  constructor(data: CommerceSubscriptionItemJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceSubscriptionItemJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.paymentSourceId = data.payment_source_id;
    this.plan = new CommercePlan(data.plan);
    this.planPeriod = data.plan_period;
    this.status = data.status;
    this.periodStart = data.period_start;
    this.periodEnd = data.period_end;
    this.canceledAt = data.canceled_at;

    this.createdAt = unixEpochToDate(data.created_at);
    this.pastDueAt = data.past_due_at ? unixEpochToDate(data.past_due_at) : null;

    this.periodStartDate = unixEpochToDate(data.period_start);
    this.periodEndDate = data.period_end ? unixEpochToDate(data.period_end) : null;
    this.canceledAtDate = data.canceled_at ? unixEpochToDate(data.canceled_at) : null;

    this.amount = data.amount ? commerceFeeFromJSON(data.amount) : undefined;
    this.credit = data.credit && data.credit.amount ? { amount: commerceFeeFromJSON(data.credit.amount) } : undefined;
    return this;
  }

  public async cancel(params: CancelSubscriptionParams) {
    const { orgId } = params;
    const json = (
      await BaseResource._fetch({
        path: orgId
          ? `/organizations/${orgId}/commerce/subscription_items/${this.id}`
          : `/me/commerce/subscription_items/${this.id}`,
        method: 'DELETE',
      })
    )?.response as unknown as DeletedObjectJSON;

    return new DeletedObject(json);
  }
}
