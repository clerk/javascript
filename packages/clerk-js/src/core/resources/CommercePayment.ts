import type {
  BillingMoneyAmount,
  BillingPaymentChargeType,
  BillingPaymentJSON,
  BillingPaymentResource,
  BillingPaymentSourceResource,
  BillingPaymentStatus,
  BillingSubscriptionItemResource,
} from '@clerk/types';

import { billingMoneyAmountFromJSON } from '../../utils';
import { unixEpochToDate } from '../../utils/date';
import { BaseResource, BillingPaymentSource, BillingSubscriptionItem } from './internal';

export class BillingPayment extends BaseResource implements BillingPaymentResource {
  id!: string;
  amount!: BillingMoneyAmount;
  failedAt?: Date;
  paidAt?: Date;
  updatedAt!: Date;
  paymentSource!: BillingPaymentSourceResource;
  subscriptionItem!: BillingSubscriptionItemResource;
  chargeType!: BillingPaymentChargeType;
  status!: BillingPaymentStatus;

  constructor(data: BillingPaymentJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: BillingPaymentJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.amount = billingMoneyAmountFromJSON(data.amount);
    this.paidAt = data.paid_at ? unixEpochToDate(data.paid_at) : undefined;
    this.failedAt = data.failed_at ? unixEpochToDate(data.failed_at) : undefined;
    this.updatedAt = unixEpochToDate(data.updated_at);
    this.paymentSource = new BillingPaymentSource(data.payment_source);
    this.subscriptionItem = new BillingSubscriptionItem(data.subscription_item);
    this.chargeType = data.charge_type;
    this.status = data.status;
    return this;
  }
}
