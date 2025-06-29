import type {
  CommerceMoney,
  CommercePaymentChargeType,
  CommercePaymentJSON,
  CommercePaymentResource,
  CommercePaymentStatus,
} from '@clerk/types';

import { commerceMoneyFromJSON } from '../../utils';
import { BaseResource, CommercePaymentSource, CommerceSubscription } from './internal';
import { parseJSON } from './parser';

export class CommercePayment extends BaseResource implements CommercePaymentResource {
  id!: string;
  amount!: CommerceMoney;
  failedAt?: Date;
  paidAt?: Date;
  updatedAt!: Date;
  paymentSource!: CommercePaymentSource;
  subscription!: CommerceSubscription;
  subscriptionItem!: CommerceSubscription;
  chargeType!: CommercePaymentChargeType;
  status!: CommercePaymentStatus;

  constructor(data: CommercePaymentJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommercePaymentJSON | null): this {
    if (!data) {
      return this;
    }

    Object.assign(
      this,
      parseJSON<CommercePaymentResource>(data, {
        dateFields: ['failedAt', 'paidAt', 'updatedAt'],
        nestedFields: {
          paymentSource: CommercePaymentSource,
          subscription: CommerceSubscription,
          subscriptionItem: CommerceSubscription,
        },
        customTransforms: {
          amount: commerceMoneyFromJSON,
        },
      }),
    );
    return this;
  }
}
