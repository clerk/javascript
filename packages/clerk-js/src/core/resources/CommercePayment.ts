import type {
  CommerceMoneyAmount,
  CommercePaymentChargeType,
  CommercePaymentJSON,
  CommercePaymentResource,
  CommercePaymentSourceResource,
  CommercePaymentStatus,
  CommerceSubscriptionItemResource,
} from '@clerk/types';

import { commerceMoneyAmountFromJSON } from '../../utils';
import { unixEpochToDate } from '../../utils/date';
import { BaseResource, CommercePaymentSource, CommerceSubscriptionItem } from './internal';

export class CommercePayment extends BaseResource implements CommercePaymentResource {
  id!: string;
  amount!: CommerceMoneyAmount;
  failedAt?: Date;
  paidAt?: Date;
  updatedAt!: Date;
  paymentSource!: CommercePaymentSourceResource;
  /**
   * @deprecated
   */
  subscription!: CommerceSubscriptionItemResource;
  subscriptionItem!: CommerceSubscriptionItemResource;
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
    this.amount = commerceMoneyAmountFromJSON(data.amount);
    this.paidAt = data.paid_at ? unixEpochToDate(data.paid_at) : undefined;
    this.failedAt = data.failed_at ? unixEpochToDate(data.failed_at) : undefined;
    this.updatedAt = unixEpochToDate(data.updated_at);
    this.paymentSource = new CommercePaymentSource(data.payment_source);
    this.subscription = new CommerceSubscriptionItem(data.subscription);
    this.subscriptionItem = new CommerceSubscriptionItem(data.subscription_item);
    this.chargeType = data.charge_type;
    this.status = data.status;
    return this;
  }
}
