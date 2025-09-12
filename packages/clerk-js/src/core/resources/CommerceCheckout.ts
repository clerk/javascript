import { retry } from '@clerk/shared/retry';
import type {
  CheckoutFutureResourceLax,
  CheckoutSignalValue,
  CommerceCheckoutJSON,
  CommerceCheckoutResource,
  CommerceCheckoutTotals,
  CommercePayerResource,
  CommerceSubscriptionPlanPeriod,
  ConfirmCheckoutParams,
  CreateCheckoutParams,
} from '@clerk/types';
import { computed, endBatch, signal, startBatch } from 'alien-signals';

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

// export class CheckoutFuture implements CheckoutFutureResourceLax {
//   private resource = new CommerceCheckout(null);
//   private readonly config: CreateCheckoutParams;
//   readonly resourceSignal = signal<{ one: CheckoutFuture | null }>({ one: this });
//   readonly errorSignal = signal<{ error: unknown }>({ error: null });
//   readonly fetchSignal = signal<{ status: 'idle' | 'fetching' }>({ status: 'idle' });
//   // @ts-expect-error - CheckoutSignal is not yet defined
//   readonly signal: CheckoutSignal = computed(() => {
//     const resource = this.resourceSignal().one
//     const error = this.errorSignal().error;
//     const fetchStatus = this.fetchSignal().status;

//     resource?.confirm.bind(resource)
//     resource?.start.bind(resource)
//     return { errors: error, fetchStatus, checkout: resource };
//   });

//   constructor(config: CreateCheckoutParams) {
//     this.config = config;
//   }

//   get status() {
//     return this.resource.status ?? 'needs_initialization';
//   }

//   get externalClientSecret() {
//     return this.resource.externalClientSecret;
//   }

//   get externalGatewayId() {
//     return this.resource.externalGatewayId;
//   }

//   get plan() {
//     return this.resource.plan;
//   }
//   get planPeriod() {
//     return this.resource.planPeriod;
//   }
//   get totals() {
//     return this.resource.totals;
//   }
//   get isImmediatePlanChange() {
//     return this.resource.isImmediatePlanChange;
//   }
//   get freeTrialEndsAt() {
//     return this.resource.freeTrialEndsAt;
//   }
//   get payer() {
//     return this.resource.payer;
//   }

//   async start(): Promise<{ error: unknown }> {
//     return runAsyncResourceTask(this, async () => {
//       const checkout = (await CommerceCheckout.clerk.billing?.startCheckout(this.config)) as CommerceCheckout;
//       this.resource = checkout;
//       this.resourceSignal({ one: this});
//     });
//   }

//   async confirm(params: ConfirmCheckoutParams): Promise<{ error: unknown }> {
//     return runAsyncResourceTask(this, async () => {
//       await this.resource.confirm(params);
//       this.resourceSignal({ one: this});
//     });
//   }
// }

// async function runAsyncResourceTask<T>(
//   source: CheckoutFuture,
//   task: () => Promise<T>,
// ): Promise<{ result?: T; error: unknown }> {
//   console.log('this',source);
//   source.errorSignal({ error: null });
//   source.fetchSignal({ status: 'fetching' });

//   try {
//     const result = await task();
//     return { result, error: null };
//   } catch (err) {
//     source.errorSignal({ error: err });
//     return { error: err };
//   } finally {
//     source.fetchSignal({ status: 'idle' });
//   }
// }

function errorsToParsedErrors(error: unknown): CheckoutSignalValue['errors'] {
  const parsedErrors: CheckoutSignalValue['errors'] = {
    raw: null,
    global: null,
  };

  if (!error) {
    return parsedErrors;
  }

  if (!isClerkAPIResponseError(error)) {
    parsedErrors.raw = [];
    parsedErrors.global = [];
    return parsedErrors;
  }

  error.errors.forEach(error => {
    if (parsedErrors.raw) {
      parsedErrors.raw.push(error);
    } else {
      parsedErrors.raw = [error];
    }

    if (parsedErrors.global) {
      parsedErrors.global.push(error);
    } else {
      parsedErrors.global = [error];
    }
  });

  return parsedErrors;
}

export const createSignals = () => {
  const resourceSignal = signal<{ resource: CheckoutFuture | null }>({ resource: null });
  const errorSignal = signal<{ error: unknown }>({ error: null });
  const fetchSignal = signal<{ status: 'idle' | 'fetching' }>({ status: 'idle' });
  // @ts-expect-error - CheckoutSignal is not yet defined
  const computedSignal: CheckoutSignal = computed(() => {
    const resource = resourceSignal().resource;
    const error = errorSignal().error;
    const fetchStatus = fetchSignal().status;

    // console.log('computedSignal', resource, error, fetchStatus);

    const errors = errorsToParsedErrors(error);
    return { errors: errors, fetchStatus, checkout: resource };
  });

  return { resourceSignal, errorSignal, fetchSignal, computedSignal };
};

export class CheckoutFuture implements CheckoutFutureResourceLax {
  private resource = new CommerceCheckout(null);
  private readonly config: CreateCheckoutParams;
  private readonly signals: ReturnType<typeof createSignals>;

  constructor(signals: ReturnType<typeof createSignals>, config: CreateCheckoutParams) {
    this.config = config;
    this.signals = signals;
    this.signals.resourceSignal({ resource: this });
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

  get paymentSource() {
    return this.resource.paymentSource ?? null;
  }

  get planPeriodStart() {
    return this.resource.planPeriodStart;
  }

  async start(): Promise<{ error: unknown }> {
    return runAsyncResourceTask(this.signals, async () => {
      const checkout = (await CommerceCheckout.clerk.billing?.startCheckout(this.config)) as CommerceCheckout;
      this.resource = checkout;
      this.signals.resourceSignal({ resource: this });
    });
  }

  async confirm(params: ConfirmCheckoutParams): Promise<{ error: unknown }> {
    return runAsyncResourceTask(this.signals, async () => {
      await this.resource.confirm(params);
      this.signals.resourceSignal({ resource: this });
    });
  }
}

async function runAsyncResourceTask<T>(
  signals: ReturnType<typeof createSignals>,
  task: () => Promise<T>,
): Promise<{ result?: T; error: unknown }> {
  startBatch();
  signals.errorSignal({ error: null });
  signals.fetchSignal({ status: 'fetching' });
  endBatch();
  startBatch();
  try {
    const result = await task();
    return { result, error: null };
  } catch (err) {
    signals.errorSignal({ error: err });
    endBatch();
    return { error: err };
  } finally {
    signals.fetchSignal({ status: 'idle' });
    endBatch();
  }
}
