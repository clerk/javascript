import { isClerkAPIResponseError } from '@clerk/shared/error';
import { retry } from '@clerk/shared/retry';
import type {
  BillingCheckoutJSON,
  BillingCheckoutResource,
  BillingCheckoutTotals,
  BillingPayerResource,
  BillingSubscriptionPlanPeriod,
  ConfirmCheckoutParams,
} from '@clerk/types';

import { unixEpochToDate } from '@/utils/date';

import { billingTotalsFromJSON } from '../../utils';
import { BillingPayer } from './BillingPayer';
import { BaseResource, BillingPaymentSource, BillingPlan } from './internal';

export class BillingCheckout extends BaseResource implements BillingCheckoutResource {
  id!: string;
  externalClientSecret!: string;
  externalGatewayId!: string;
  paymentSource?: BillingPaymentSource;
  plan!: BillingPlan;
  planPeriod!: BillingSubscriptionPlanPeriod;
  planPeriodStart!: number | undefined;
  status!: 'needs_confirmation' | 'completed';
  totals!: BillingCheckoutTotals;
  isImmediatePlanChange!: boolean;
  freeTrialEndsAt!: Date | null;
  payer!: BillingPayerResource;

  constructor(data: BillingCheckoutJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: BillingCheckoutJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.externalClientSecret = data.external_client_secret;
    this.externalGatewayId = data.external_gateway_id;
    this.paymentSource = data.payment_source ? new BillingPaymentSource(data.payment_source) : undefined;
    this.plan = new BillingPlan(data.plan);
    this.planPeriod = data.plan_period;
    this.planPeriodStart = data.plan_period_start;
    this.status = data.status;
    this.totals = billingTotalsFromJSON(data.totals);
    this.isImmediatePlanChange = data.is_immediate_plan_change;
    this.freeTrialEndsAt = data.free_trial_ends_at ? unixEpochToDate(data.free_trial_ends_at) : null;
    this.payer = new BillingPayer(data.payer);
    return this;
  }

  confirm = (params: ConfirmCheckoutParams): Promise<this> => {
    // Retry confirmation in case of a 500 error
    // This will retry up to 3 times with an increasing delay
    // It retries at 2s, 4s, 6s and 8s
    return retry(
      () =>
        this._basePatch({
          path: this.payer.organizationId
            ? `/organizations/${this.payer.organizationId}/commerce/checkouts/${this.id}/confirm`
            : `/me/commerce/checkouts/${this.id}/confirm`,
          body: params as any,
        }),
      {
        factor: 1.1,
        maxDelayBetweenRetries: 2 * 1_000,
        initialDelay: 2 * 1_000,
        jitter: false,
        shouldRetry(error: any, iterations: number) {
          if (!isClerkAPIResponseError(error) || iterations >= 4) {
            return false;
          }

          const status = error?.status;
          const isServerError = status >= 500;
          const checkoutAlreadyInProgress =
            status === 409 && error.errors?.[0]?.code === 'checkout_already_in_progress';

          return isServerError || checkoutAlreadyInProgress;
        },
      },
    );
  };
}
