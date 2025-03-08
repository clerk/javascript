import type {
  CommerceCheckoutJSON,
  CommerceCheckoutResource,
  CommerceTotals,
  ConfirmCheckoutParams,
} from '@clerk/types';

import { commerceTotalsFromJSON } from '../../utils';
import { BaseResource, CommerceInvoice, CommercePaymentSource, CommercePlan, CommerceSubscription } from './internal';

export class CommerceCheckout extends BaseResource implements CommerceCheckoutResource {
  pathRoot = '/me/commerce/checkouts';

  id!: string;
  externalClientSecret!: string;
  externalGatewayId!: string;
  invoice?: CommerceInvoice;
  paymentSource?: CommercePaymentSource;
  plan!: CommercePlan;
  planPeriod!: string;
  status!: string;
  subscription?: CommerceSubscription;
  totals!: CommerceTotals;

  constructor(data: CommerceCheckoutJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceCheckoutJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.externalClientSecret = data.external_client_secret;
    this.externalGatewayId = data.external_gateway_id;
    this.invoice = data.invoice ? new CommerceInvoice(data.invoice) : undefined;
    this.paymentSource = data.payment_source ? new CommercePaymentSource(data.payment_source) : undefined;
    this.plan = new CommercePlan(data.plan);
    this.planPeriod = data.plan_period;
    this.status = data.status;
    this.subscription = data.subscription ? new CommerceSubscription(data.subscription) : undefined;
    this.totals = commerceTotalsFromJSON(data.totals);

    return this;
  }

  confirm = (params?: ConfirmCheckoutParams): Promise<this> => {
    return this._basePatch({
      path: `/me/commerce/checkouts/${this.id}/confirm`,
      body: params as any,
    });
  };
}
