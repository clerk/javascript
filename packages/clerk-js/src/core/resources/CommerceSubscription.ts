import type {
  CancelSubscriptionParams,
  CommerceMoney,
  CommerceSubscriptionJSON,
  CommerceSubscriptionPlanPeriod,
  CommerceSubscriptionResource,
  CommerceSubscriptionStatus,
  DeletedObjectJSON,
} from '@clerk/types';

import { unixEpochToDate } from '@/utils/date';

import { commerceMoneyFromJSON } from '../../utils';
import { BaseResource, CommercePlan, DeletedObject } from './internal';

export class CommerceSubscription extends BaseResource implements CommerceSubscriptionResource {
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
  amount?: CommerceMoney;
  credit?: {
    amount: CommerceMoney;
  };

  constructor(data: CommerceSubscriptionJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceSubscriptionJSON | null): this {
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

    this.amount = data.amount ? commerceMoneyFromJSON(data.amount) : undefined;
    this.credit = data.credit && data.credit.amount ? { amount: commerceMoneyFromJSON(data.credit.amount) } : undefined;
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
