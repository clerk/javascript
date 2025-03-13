import type {
  __experimental_CommerceCheckoutJSON,
  __experimental_CommerceCheckoutResource,
  __experimental_CommerceTotals,
  __experimental_ConfirmCheckoutParams,
} from '@clerk/types';

import { commerceTotalsFromJSON } from '../../utils';
import {
  __experimental_CommerceInvoice,
  __experimental_CommercePaymentSource,
  __experimental_CommercePlan,
  __experimental_CommerceSubscription,
  BaseResource,
} from './internal';

export class __experimental_CommerceCheckout extends BaseResource implements __experimental_CommerceCheckoutResource {
  pathRoot = '/me/commerce/checkouts';

  id!: string;
  externalClientSecret!: string;
  externalGatewayId!: string;
  invoice?: __experimental_CommerceInvoice;
  paymentSource?: __experimental_CommercePaymentSource;
  plan!: __experimental_CommercePlan;
  planPeriod!: string;
  status!: string;
  subscription?: __experimental_CommerceSubscription;
  totals!: __experimental_CommerceTotals;

  constructor(data: __experimental_CommerceCheckoutJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: __experimental_CommerceCheckoutJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.externalClientSecret = data.external_client_secret;
    this.externalGatewayId = data.external_gateway_id;
    this.invoice = data.invoice ? new __experimental_CommerceInvoice(data.invoice) : undefined;
    this.paymentSource = data.payment_source
      ? new __experimental_CommercePaymentSource(data.payment_source)
      : undefined;
    this.plan = new __experimental_CommercePlan(data.plan);
    this.planPeriod = data.plan_period;
    this.status = data.status;
    this.subscription = data.subscription ? new __experimental_CommerceSubscription(data.subscription) : undefined;
    this.totals = commerceTotalsFromJSON(data.totals);

    return this;
  }

  confirm = (params?: __experimental_ConfirmCheckoutParams): Promise<this> => {
    return this._basePatch({
      path: this.path('confirm'),
      body: params as any,
    });
  };
}
