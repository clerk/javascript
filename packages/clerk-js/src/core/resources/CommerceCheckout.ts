import { retry } from '@clerk/shared/retry';
import type {
  CommerceCheckoutJSON,
  CommerceCheckoutResource,
  CommerceCheckoutTotals,
  CommerceSubscriptionPlanPeriod,
  ConfirmCheckoutParams,
} from '@clerk/types';

import { unixEpochToDate } from '@/utils/date';

import { commerceTotalsFromJSON } from '../../utils';
import { BaseResource, CommercePaymentSource, CommercePlan, isClerkAPIResponseError } from './internal';

export class CommerceCheckout extends BaseResource implements CommerceCheckoutResource {
  id!: string;
  externalClientSecret!: string;
  externalGatewayId!: string;
  paymentSource?: CommercePaymentSource;
  plan!: CommercePlan;
  planPeriod!: CommerceSubscriptionPlanPeriod;
  planPeriodStart!: number | undefined;
  status!: 'needs_confirmation' | 'completed';
  totals!: CommerceCheckoutTotals;
  isImmediatePlanChange!: boolean;
  freeTrialEndsAt!: Date | null;

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
    this.paymentSource = data.payment_source ? new CommercePaymentSource(data.payment_source) : undefined;
    this.plan = new CommercePlan(data.plan);
    this.planPeriod = data.plan_period;
    this.planPeriodStart = data.plan_period_start;
    this.status = data.status;
    this.totals = commerceTotalsFromJSON(data.totals);
    this.isImmediatePlanChange = data.is_immediate_plan_change;
    this.freeTrialEndsAt = data.free_trial_ends_at ? unixEpochToDate(data.free_trial_ends_at) : null;
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
