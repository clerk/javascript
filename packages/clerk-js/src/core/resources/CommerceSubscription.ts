import type { CommerceSubscriptionJSON, CommerceSubscriptionResource } from '@clerk/types';

import { BaseResource, CommercePlan } from './internal';

export class CommerceSubscription extends BaseResource implements CommerceSubscriptionResource {
  id!: string;
  paymentSourceId!: string;
  plan!: CommercePlan;
  planPeriod!: string;
  status!: string;

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

    return this;
  }

  public async cancel() {
    const json = (
      await BaseResource._fetch({
        path: `/me/commerce/subscriptions/${this.id}`,
        method: 'DELETE',
      })
    )?.response;
    return json;
  }
}
