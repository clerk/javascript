import { isClerkAPIResponseError } from '@clerk/shared/error';
import { retry } from '@clerk/shared/retry';
import type {
  BillingCheckoutJSON,
  BillingCheckoutResource,
  BillingCheckoutTotals,
  BillingPayerResource,
  BillingPaymentMethodResource,
  BillingSubscriptionPlanPeriod,
  CheckoutFutureResource,
  CheckoutFutureResourceLax,
  CheckoutSignalValue,
  ConfirmCheckoutParams,
  CreateCheckoutParams,
} from '@clerk/shared/types';
import { computed, endBatch, signal, startBatch } from 'alien-signals';

import { unixEpochToDate } from '@/utils/date';

import { billingTotalsFromJSON } from '../../utils';
import { Billing } from '../modules/billing/namespace';
import { BillingPayer } from './BillingPayer';
import { BaseResource, BillingPaymentMethod, BillingPlan } from './internal';

export class BillingCheckout extends BaseResource implements BillingCheckoutResource {
  id!: string;
  externalClientSecret!: string;
  externalGatewayId!: string;
  paymentMethod?: BillingPaymentMethodResource;
  plan!: BillingPlan;
  planPeriod!: BillingSubscriptionPlanPeriod;
  planPeriodStart!: number | undefined;
  status!: 'needs_confirmation' | 'completed';
  totals!: BillingCheckoutTotals;
  isImmediatePlanChange!: boolean;
  freeTrialEndsAt?: Date;
  payer!: BillingPayerResource;
  needsPaymentMethod!: boolean;

  constructor(data: BillingCheckoutJSON | null = null) {
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
    this.paymentMethod = data.payment_method ? new BillingPaymentMethod(data.payment_method) : undefined;
    this.plan = new BillingPlan(data.plan);
    this.planPeriod = data.plan_period;
    this.planPeriodStart = data.plan_period_start;
    this.status = data.status;
    this.totals = billingTotalsFromJSON(data.totals);
    this.isImmediatePlanChange = data.is_immediate_plan_change;
    if (data.free_trial_ends_at) {
      this.freeTrialEndsAt = unixEpochToDate(data.free_trial_ends_at);
    }
    this.payer = new BillingPayer(data.payer);
    this.needsPaymentMethod = data.needs_payment_method;
    return this;
  }

  confirm = (params: ConfirmCheckoutParams): Promise<this> => {
    // Retry confirmation in case of a 500 error
    // This will retry up to 3 times with an increasing delay
    // It retries at 2s, 4s, 6s and 8s
    return retry(
      () =>
        this._basePatch({
          path: Billing.path(`/checkouts/${this.id}/confirm`, { orgId: this.payer.organizationId }),
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
  const computedSignal = computed<Omit<CheckoutSignalValue, 'checkout'> & { checkout: CheckoutFutureResource | null }>(
    () => {
      const resource = resourceSignal().resource;
      const error = errorSignal().error;
      const fetchStatus = fetchSignal().status;

      const errors = errorsToParsedErrors(error);
      return { errors: errors, fetchStatus, checkout: resource };
    },
  );

  return { resourceSignal, errorSignal, fetchSignal, computedSignal };
};

export class CheckoutFuture implements CheckoutFutureResourceLax {
  private resource = new BillingCheckout(null);
  private readonly config: CreateCheckoutParams;
  private readonly signals: ReturnType<typeof createSignals>;
  private readonly pendingOperations = new Map<string, Promise<{ error: unknown }> | null>();

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

  get paymentMethod() {
    return this.resource.paymentMethod ?? null;
  }

  get planPeriodStart() {
    return this.resource.planPeriodStart;
  }

  get needsPaymentMethod() {
    return this.resource.needsPaymentMethod;
  }

  async start(): Promise<{ error: unknown }> {
    return this.runAsyncResourceTask(
      'start',
      async () => {
        const checkout = (await BillingCheckout.clerk.billing?.startCheckout(this.config)) as BillingCheckout;
        this.resource = checkout;
      },
      () => {
        this.resource = new BillingCheckout(null);
        this.signals.resourceSignal({ resource: this });
      },
    );
  }

  async confirm(params: ConfirmCheckoutParams): Promise<{ error: unknown }> {
    return this.runAsyncResourceTask('confirm', async () => {
      if (!this.resource.id) {
        throw new Error('Clerk: Call `start` before `confirm`');
      }
      await this.resource.confirm(params);
    });
  }

  private runAsyncResourceTask<T>(operationType: string, task: () => Promise<T>, beforeTask?: () => void) {
    return createRunAsyncResourceTask(this, this.signals, this.pendingOperations)(operationType, task, beforeTask);
  }
}

function createRunAsyncResourceTask(
  resource: CheckoutFuture,
  signals: ReturnType<typeof createSignals>,
  pendingOperations: Map<string, Promise<{ error: unknown }> | null>,
): <T>(operationType: string, task: () => Promise<T>, beforeTask?: () => void) => Promise<{ error: unknown }> {
  return async (operationType, task, beforeTask?: () => void) => {
    if (pendingOperations.get(operationType)) {
      // Wait for the existing operation to complete and return its result
      // If it fails, all callers should receive the same error
      return pendingOperations.get(operationType) as Promise<{ error: unknown }>;
    }

    const operationPromise = (async () => {
      startBatch();
      signals.errorSignal({ error: null });
      signals.fetchSignal({ status: 'fetching' });
      beforeTask?.();
      endBatch();
      startBatch();
      try {
        await task();
        signals.resourceSignal({ resource: resource });
        return { error: null };
      } catch (err) {
        signals.errorSignal({ error: err });
        return { error: err };
      } finally {
        pendingOperations.delete(operationType);
        signals.fetchSignal({ status: 'idle' });
        endBatch();
      }
    })();

    pendingOperations.set(operationType, operationPromise);
    return operationPromise;
  };
}
