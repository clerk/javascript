import { retry } from '@clerk/shared/retry';
import type {
  CommerceCheckoutJSON,
  CommerceCheckoutResource,
  CommerceCheckoutTotals,
  CommerceSubscriptionPlanPeriod,
  ConfirmCheckoutParams,
} from '@clerk/types';

import { commerceTotalsFromJSON } from '../../utils';
import { BaseResource, CommercePaymentSource, CommercePlan, isClerkAPIResponseError } from './internal';
import { parseJSON } from './parser';

export class CommerceCheckout extends BaseResource implements CommerceCheckoutResource {
  id!: string;
  externalClientSecret!: string;
  externalGatewayId!: string;
  statement_id!: string;
  paymentSource?: CommercePaymentSource;
  plan!: CommercePlan;
  planPeriod!: CommerceSubscriptionPlanPeriod;
  planPeriodStart!: number | undefined;
  status!: string;
  totals!: CommerceCheckoutTotals;
  isImmediatePlanChange!: boolean;

  constructor(data: CommerceCheckoutJSON, orgId?: string) {
    super();
    this.fromJSON(data);
    this.pathRoot = orgId ? `/organizations/${orgId}/commerce/checkouts` : `/me/commerce/checkouts`;
  }

  protected fromJSON(data: CommerceCheckoutJSON | null): this {
    Object.assign(
      this,
      parseJSON<CommerceCheckout>(data, {
        customTransforms: {
          paymentSource: value => (value ? new CommercePaymentSource(value) : undefined),
          plan: value => new CommercePlan(value),
          totals: value => commerceTotalsFromJSON(value),
        },
      }),
    );
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
