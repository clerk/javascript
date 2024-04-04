import type {
  BillingCycle,
  BillingPlanJSON,
  BillingPlanResource,
  CheckoutSessionJSON,
  CheckoutSessionResource,
  PaymentMethod,
  PortalSessionJSON,
  PortalSessionResource,
} from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';

export class BillingPlan extends BaseResource implements BillingPlanResource {
  id!: string;
  name!: string;
  description!: string | null;
  key!: string;
  priceInCents!: number;
  features!: string[];
  billingCycle!: BillingCycle;
  paymentMethod!: PaymentMethod | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: BillingPlanJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: BillingPlanJSON): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.key = data.key;
    this.priceInCents = data.price_in_cents;
    this.features = data.features;
    // TODO We need to create a separate resource for current billing
    // as the current setup is breaking the available plans
    this.billingCycle = {
      startDate: unixEpochToDate(data.billing_cycle.start_date),
      endDate: unixEpochToDate(data.billing_cycle.end_date),
    };
    this.paymentMethod = data.payment_method && {
      type: data.payment_method.type,
      id: data.payment_method.id,
      createdAt: unixEpochToDate(data.payment_method.created_at),
      card: {
        brand: data.payment_method.card.brand,
        last4: data.payment_method.card.last4,
        expMonth: data.payment_method.card.exp_month,
        expYear: data.payment_method.card.exp_year,
      },
    };
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);

    return this;
  }
}

export class PortalSession extends BaseResource implements PortalSessionResource {
  redirectUrl!: string;

  constructor(data: PortalSessionJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: PortalSessionJSON): this {
    this.redirectUrl = data.redirect_url;

    return this;
  }
}

export class CheckoutSession extends BaseResource implements CheckoutSessionResource {
  redirectUrl!: string;

  constructor(data: CheckoutSessionJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CheckoutSessionJSON): this {
    this.redirectUrl = data.redirect_url;

    return this;
  }
}
