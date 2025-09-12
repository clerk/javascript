import { retry } from '@clerk/shared/retry';
import type {
  CheckoutFutureResourceLax,
  CheckoutSignal,
  CommerceCheckoutJSON,
  CommerceCheckoutResource,
  CommerceCheckoutTotals,
  CommercePayerResource,
  CommerceSubscriptionPlanPeriod,
  ConfirmCheckoutParams,
  CreateCheckoutParams,
} from '@clerk/types';
import { computed, signal } from 'alien-signals';

import { unixEpochToDate } from '@/utils/date';

import { commerceTotalsFromJSON } from '../../utils';
import { CommercePayer } from './CommercePayer';
import { BaseResource, CommercePaymentSource, CommercePlan, isClerkAPIResponseError } from './internal';

// export class CommerceCheckout extends BaseResource implements CommerceCheckoutResource {
//   id!: string;
//   externalClientSecret!: string;
//   externalGatewayId!: string;
//   paymentSource?: CommercePaymentSource;
//   plan!: CommercePlan;
//   planPeriod!: CommerceSubscriptionPlanPeriod;
//   planPeriodStart!: number | undefined;
//   status!: 'needs_confirmation' | 'completed';
//   totals!: CommerceCheckoutTotals;
//   isImmediatePlanChange!: boolean;
//   freeTrialEndsAt!: Date | null;
//   payer!: CommercePayerResource;

//   constructor(data: CommerceCheckoutJSON) {
//     super();
//     this.fromJSON(data);
//   }

//   protected fromJSON(data: CommerceCheckoutJSON | null): this {
//     if (!data) {
//       return this;
//     }

//     this.id = data.id;
//     this.externalClientSecret = data.external_client_secret;
//     this.externalGatewayId = data.external_gateway_id;
//     this.paymentSource = data.payment_source ? new CommercePaymentSource(data.payment_source) : undefined;
//     this.plan = new CommercePlan(data.plan);
//     this.planPeriod = data.plan_period;
//     this.planPeriodStart = data.plan_period_start;
//     this.status = data.status;
//     this.totals = commerceTotalsFromJSON(data.totals);
//     this.isImmediatePlanChange = data.is_immediate_plan_change;
//     this.freeTrialEndsAt = data.free_trial_ends_at ? unixEpochToDate(data.free_trial_ends_at) : null;
//     this.payer = new CommercePayer(data.payer);
//     return this;
//   }

//   confirm = (params: ConfirmCheckoutParams): Promise<this> => {
//     // Retry confirmation in case of a 500 error
//     // This will retry up to 3 times with an increasing delay
//     // It retries at 2s, 4s, 6s and 8s
//     return retry(
//       () =>
//         this._basePatch({
//           path: this.payer.organizationId
//             ? `/organizations/${this.payer.organizationId}/commerce/checkouts/${this.id}/confirm`
//             : `/me/commerce/checkouts/${this.id}/confirm`,
//           body: params as any,
//         }),
//       {
//         factor: 1.1,
//         maxDelayBetweenRetries: 2 * 1_000,
//         initialDelay: 2 * 1_000,
//         jitter: false,
//         shouldRetry(error: any, iterations: number) {
//           if (!isClerkAPIResponseError(error) || iterations >= 4) {
//             return false;
//           }

//           const status = error?.status;
//           const isServerError = status >= 500;
//           const checkoutAlreadyInProgress =
//             status === 409 && error.errors?.[0]?.code === 'checkout_already_in_progress';

//           return isServerError || checkoutAlreadyInProgress;
//         },
//       },
//     );
//   };
// }

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
  payer!: CommercePayerResource;

  constructor(data: CommerceCheckoutJSON | null = null) {
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
    this.paymentSource = data.payment_source ? new CommercePaymentSource(data.payment_source) : undefined;
    this.plan = new CommercePlan(data.plan);
    this.planPeriod = data.plan_period;
    this.planPeriodStart = data.plan_period_start;
    this.status = data.status;
    this.totals = commerceTotalsFromJSON(data.totals);
    this.isImmediatePlanChange = data.is_immediate_plan_change;
    this.freeTrialEndsAt = data.free_trial_ends_at ? unixEpochToDate(data.free_trial_ends_at) : null;
    this.payer = new CommercePayer(data.payer);
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

export class CheckoutFuture implements CheckoutFutureResourceLax {
  private resource = new CommerceCheckout(null);
  private readonly config: CreateCheckoutParams;
  readonly resourceSignal = signal<{ resource: CommerceCheckout | null }>({ resource: this.resource });
  readonly errorSignal = signal<{ error: unknown }>({ error: null });
  readonly fetchSignal = signal<{ status: 'idle' | 'fetching' }>({ status: 'idle' });
  readonly signal: CheckoutSignal = computed(() => {
    const resource = this.resourceSignal().resource;
    const error = this.errorSignal().error;
    const fetchStatus = this.fetchSignal().status;
    return { errors: error, fetchStatus, checkout: resource };
  });

  constructor(config: CreateCheckoutParams) {
    this.config = config;
  }

  get status() {
    return this.resource.status ?? 'needs_initialization';
  }

  get externalClientSecret() {
    return this.resource.externalClientSecret;
  }

  get externalGatewayId() {
    return this.resource.externalGatewayId;
  }

  get plan() {
    return this.resource.plan;
  }
  get planPeriod() {
    return this.resource.planPeriod;
  }
  get totals() {
    return this.resource.totals;
  }
  get isImmediatePlanChange() {
    return this.resource.isImmediatePlanChange;
  }
  get freeTrialEndsAt() {
    return this.resource.freeTrialEndsAt;
  }
  get payer() {
    return this.resource.payer;
  }

  async startCheckout(): Promise<{ error: unknown }> {
    return runAsyncResourceTask(this, async () => {
      const checkout = (await CommerceCheckout.clerk.billing?.startCheckout(this.config)) as CommerceCheckout;
      this.resource = checkout;
    });
  }

  async confirm(params: ConfirmCheckoutParams): Promise<{ error: unknown }> {
    return runAsyncResourceTask(this, async () => {
      await this.resource.confirm(params);
    });
  }
}

async function runAsyncResourceTask<T>(
  source: CheckoutFuture,
  task: () => Promise<T>,
): Promise<{ result?: T; error: unknown }> {
  source.errorSignal({ error: null });
  source.fetchSignal({ status: 'fetching' });

  try {
    const result = await task();
    return { result, error: null };
  } catch (err) {
    source.errorSignal({ error: err });
    return { error: err };
  } finally {
    source.fetchSignal({ status: 'idle' });
  }
}
