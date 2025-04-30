import { retry } from '@clerk/shared/retry';
import type {
  CommerceCheckoutJSON,
  CommerceCheckoutResource,
  CommerceCheckoutTotals,
  CommercePaymentSourceResource,
  CommercePlanResource,
  CommerceSubscriptionPlanPeriod,
  CommerceSubscriptionResource,
  ConfirmCheckoutParams,
} from '@clerk/types';

import { commerceTotalsFromJSON } from '../../utils';
import { BaseResource, CommercePaymentSource, CommercePlan, CommerceSubscription } from './internal';

export class CommerceCheckout extends BaseResource implements CommerceCheckoutResource {
  id!: string;
  externalClientSecret!: string;
  externalGatewayId!: string;
  invoice_id!: string;
  paymentSource?: CommercePaymentSourceResource;
  plan!: CommercePlanResource;
  planPeriod!: CommerceSubscriptionPlanPeriod;
  status!: string;
  subscription?: CommerceSubscriptionResource;
  totals!: CommerceCheckoutTotals;

  constructor(data: CommerceCheckoutJSON, orgId?: string) {
    super();
    this.fromJSON(data);
    this.pathRoot = orgId ? `/organizations/${orgId}/commerce/checkouts` : `/me/commerce/checkouts`;
  }

  protected fromJSON(data: CommerceCheckoutJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.externalClientSecret = data.external_client_secret;
    this.externalGatewayId = data.external_gateway_id;
    this.invoice_id = data.invoice_id;
    this.paymentSource = data.payment_source ? new CommercePaymentSource(data.payment_source) : undefined;
    this.plan = new CommercePlan(data.plan);
    this.planPeriod = data.plan_period;
    this.status = data.status;
    this.subscription = data.subscription ? new CommerceSubscription(data.subscription) : undefined;
    this.totals = commerceTotalsFromJSON(data.totals);

    return this;
  }

  confirm = (params: ConfirmCheckoutParams): Promise<this> => {
    const { orgId, ...rest } = params;

    // Retry confirmation in case of a 500 error
    // This will retry up to 3 times with an increasing delay
    // It retries at 2s, 4s, 6s and 8s
    return retry(
      () =>
        this._basePatch({
          path: orgId
            ? `/organizations/${orgId}/commerce/checkouts/${this.id}/confirm`
            : `/me/commerce/checkouts/${this.id}/confirm`,
          body: rest as any,
        }),
      {
        factor: 1.1,
        maxDelayBetweenRetries: 2 * 1_000,
        initialDelay: 2 * 1_000,
        jitter: false,
        shouldRetry(error: any, iterations: number) {
          const status = error?.status;
          return !!status && status >= 500 && iterations <= 4;
        },
      },
    );
  };
}
