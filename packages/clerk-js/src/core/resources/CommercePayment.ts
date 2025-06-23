import type {
  CommerceMoney,
  CommercePaymentChargeType,
  CommercePaymentJSON,
  CommercePaymentResource,
  CommercePaymentStatus,
} from '@clerk/types';

import { commerceMoneyFromJSON } from '../../utils';
import { unixEpochToDate } from '../../utils/date';
import { BaseResource, CommercePaymentSource, CommerceSubscription } from './internal';

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

    this.id = data.id;
    this.amount = commerceMoneyFromJSON(data.amount);
    this.paidAt = data.paid_at ? unixEpochToDate(data.paid_at) : undefined;
    this.failedAt = data.failed_at ? unixEpochToDate(data.failed_at) : undefined;
    this.updatedAt = unixEpochToDate(data.updated_at);
    this.paymentSource = new CommercePaymentSource(data.payment_source);
    this.subscription = new CommerceSubscription(data.subscription);
    this.subscriptionItem = new CommerceSubscription(data.subscription_item);
    this.chargeType = data.charge_type;
    this.status = data.status;
    return this;
  }
}
