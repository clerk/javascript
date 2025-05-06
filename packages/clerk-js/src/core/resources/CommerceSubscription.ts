import type {
  CancelSubscriptionParams,
  CommerceSubscriptionJSON,
  CommerceSubscriptionPlanPeriod,
  CommerceSubscriptionResource,
  CommerceSubscriptionStatus,
  DeletedObjectJSON,
} from '@clerk/types';

import { BaseResource, CommercePlan, DeletedObject } from './internal';

export class CommerceSubscription extends BaseResource implements CommerceSubscriptionResource {
  id!: string;
  paymentSourceId!: string;
  plan!: CommercePlan;
  planPeriod!: CommerceSubscriptionPlanPeriod;
  status!: CommerceSubscriptionStatus;
  periodStart!: number;
  periodEnd!: number;
  canceledAt!: number | null;
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
    return this;
  }

  public async cancel(params: CancelSubscriptionParams) {
    const { orgId } = params;
    const json = (
      await BaseResource._fetch({
        path: orgId
          ? `/organizations/${orgId}/commerce/subscriptions/${this.id}`
          : `/me/commerce/subscriptions/${this.id}`,
        method: 'DELETE',
      })
    )?.response as unknown as DeletedObjectJSON;

    return new DeletedObject(json);
  }
}
