import type {
  BillingMoneyAmount,
  BillingPaymentChargeType,
  BillingPaymentJSON,
  BillingPaymentMethodResource,
  BillingPaymentResource,
  BillingPaymentStatus,
  BillingSubscriptionItemResource,
} from '@clerk/shared/types';

import { billingMoneyAmountFromJSON } from '../../utils';
import { unixEpochToDate } from '../../utils/date';
import { BaseResource, BillingPaymentMethod, BillingSubscriptionItem } from './internal';

export class BillingPayment extends BaseResource implements BillingPaymentResource {
  id!: string;
  amount!: BillingMoneyAmount;
  failedAt: Date | null = null;
  paidAt: Date | null = null;
  updatedAt!: Date;
  paymentMethod: BillingPaymentMethodResource | null = null;
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
    this.paidAt = data.paid_at ? unixEpochToDate(data.paid_at) : null;
    this.failedAt = data.failed_at ? unixEpochToDate(data.failed_at) : null;
    this.updatedAt = unixEpochToDate(data.updated_at);
    this.paymentMethod = data.payment_method ? new BillingPaymentMethod(data.payment_method) : null;
    this.subscriptionItem = new BillingSubscriptionItem(data.subscription_item);
    this.chargeType = data.charge_type;
    this.status = data.status;
    return this;
  }
}
