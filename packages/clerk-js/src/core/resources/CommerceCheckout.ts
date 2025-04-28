import { retry } from '@clerk/shared/retry';
import type {
  __experimental_CommerceCheckoutJSON,
  __experimental_CommerceCheckoutResource,
  __experimental_CommerceCheckoutTotals,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_ConfirmCheckoutParams,
} from '@clerk/types';

import { commerceTotalsFromJSON } from '../../utils';
import {
  __experimental_CommercePaymentSource,
  __experimental_CommercePlan,
  __experimental_CommerceSubscription,
  BaseResource,
} from './internal';

export class __experimental_CommerceCheckout extends BaseResource implements __experimental_CommerceCheckoutResource {
  id!: string;
  externalClientSecret!: string;
  externalGatewayId!: string;
  invoice_id!: string;
  paymentSource?: __experimental_CommercePaymentSource;
  plan!: __experimental_CommercePlan;
  planPeriod!: __experimental_CommerceSubscriptionPlanPeriod;
  status!: string;
  subscription?: __experimental_CommerceSubscription;
  totals!: __experimental_CommerceCheckoutTotals;

  constructor(data: __experimental_CommerceCheckoutJSON, orgId?: string) {
    super();
    this.fromJSON(data);
    this.pathRoot = orgId ? `/organizations/${orgId}/commerce/checkouts` : `/me/commerce/checkouts`;
  }

  protected fromJSON(data: __experimental_CommerceCheckoutJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.externalClientSecret = data.external_client_secret;
    this.externalGatewayId = data.external_gateway_id;
    this.invoice_id = data.invoice_id;
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

  confirm = (params: __experimental_ConfirmCheckoutParams): Promise<this> => {
    const { orgId, ...rest } = params;

    // Retry confirmation in case of a 500 error
    // This will retry up to 6 times with an increasing delay
    // It retries at 2s, 5s, ~9s, ~14s, ~19s, and ~24s after the initial attempt.
    return retry(
      () =>
        this._basePatch({
          path: orgId
            ? `/organizations/${orgId}/commerce/checkouts/${this.id}/confirm`
            : `/me/commerce/checkouts/${this.id}/confirm`,
          body: rest as any,
        }),
      {
        factor: 1.45,
        maxDelayBetweenRetries: 5 * 1_000,
        initialDelay: 2 * 1_000,
        jitter: false,
        shouldRetry(error: any, iterations: number) {
          const status = error?.status;
          return !!status && status >= 500 && iterations <= 6;
        },
      },
    );
  };
}
