import type {
  CancelSubscriptionParams,
  CommerceMoney,
  CommerceSubscriptionJSON,
  CommerceSubscriptionPlanPeriod,
  CommerceSubscriptionResource,
  CommerceSubscriptionStatus,
  DeletedObjectJSON,
} from '@clerk/types';

import { commerceMoneyFromJSON } from '../../utils';
import { BaseResource, CommercePlan, DeletedObject } from './internal';
import { parseJSON } from './parser';

export class CommerceSubscription extends BaseResource implements CommerceSubscriptionResource {
  id!: string;
  paymentSourceId!: string;
  plan!: CommercePlan;
  planPeriod!: CommerceSubscriptionPlanPeriod;
  status!: CommerceSubscriptionStatus;
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

    Object.assign(
      this,
      parseJSON<CommerceSubscriptionResource>(data, {
        nestedFields: {
          plan: CommercePlan,
        },
        customTransforms: {
          amount: value => (value ? commerceMoneyFromJSON(value) : undefined),
          credit: value => (value && value.amount ? { amount: commerceMoneyFromJSON(value.amount) } : undefined),
        },
      }),
    );
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
