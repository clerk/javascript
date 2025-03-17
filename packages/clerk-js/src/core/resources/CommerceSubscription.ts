import type {
  __experimental_CommerceSubscriptionJSON,
  __experimental_CommerceSubscriptionResource,
} from '@clerk/types';

import { __experimental_CommercePlan, BaseResource } from './internal';

export class __experimental_CommerceSubscription
  extends BaseResource
  implements __experimental_CommerceSubscriptionResource
{
  id!: string;
  paymentSourceId!: string;
  plan!: __experimental_CommercePlan;
  planPeriod!: string;
  status!: string;

  constructor(data: __experimental_CommerceSubscriptionJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: __experimental_CommerceSubscriptionJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.paymentSourceId = data.payment_source_id;
    this.plan = new __experimental_CommercePlan(data.plan);
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
