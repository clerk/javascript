import type { ClerkError } from '@clerk/shared/error';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import { checkoutSchema } from '@clerk/shared/resourceSchemas';
import { retry } from '@clerk/shared/retry';
import type {
  BillingCheckoutJSON,
  BillingCheckoutResource,
  BillingCheckoutTotals,
  BillingPayerResource,
  BillingPaymentMethodResource,
  BillingSubscriptionPlanPeriod,
  CheckoutFlowFinalizeParams,
  CheckoutFlowResourceNonStrict,
  CheckoutSignalValue,
  ConfirmCheckoutParams,
  CreateCheckoutParams,
} from '@clerk/shared/types';
import { endBatch, startBatch } from 'alien-signals';

import { unixEpochToDate } from '@/utils/date';

import { billingTotalsFromJSON } from '../../utils';
import { Billing } from '../modules/billing/namespace';
import { createResourceSignals, type ResourceSignals } from '../signalFactory';
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

/**
 * Checkout signal set type for use in CheckoutFlow.
 */
type CheckoutSignals = ResourceSignals<CheckoutFlow> & {
  computedSignal: () => CheckoutSignalValue;
};

/**
 * Creates signals for the Checkout resource.
 * Uses shared factory - Checkout is a "keyed" resource with its own lifecycle.
 */
export const createSignals = (): CheckoutSignals => {
  return createResourceSignals<CheckoutFlow>({
    name: checkoutSchema.name,
    errorFields: checkoutSchema.errorFields,
  }) as CheckoutSignals;
};

type CheckoutTask = 'start' | 'confirm' | 'finalize';

export class CheckoutFlow implements CheckoutFlowResourceNonStrict {
  private resource = new BillingCheckout(null);
  private readonly config: CreateCheckoutParams;
  private readonly signals: CheckoutSignals;
  private readonly pendingOperations = new Map<CheckoutTask, Promise<{ error: unknown }> | null>();

  constructor(signals: CheckoutSignals, config: CreateCheckoutParams) {
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

  async start(): Promise<{ error: ClerkError | null }> {
    return this.runAsyncCheckoutTask(
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

  async confirm(params: ConfirmCheckoutParams): Promise<{ error: ClerkError | null }> {
    if (!this.resource.id) {
      throw new Error('Clerk: `start()` must be called before `confirm()`');
    }
    return this.runAsyncCheckoutTask('confirm', async () => {
      await this.resource.confirm(params);
    });
  }

  async finalize(params?: CheckoutFlowFinalizeParams): Promise<{ error: ClerkError | null }> {
    const { navigate } = params || {};
    return this.runAsyncCheckoutTask('finalize', async () => {
      if (this.resource.status !== 'completed') {
        throw new Error('Clerk: `confirm()` must be called before `finalize()`');
      }

      await BillingCheckout.clerk.setActive({ session: BillingCheckout.clerk.session?.id, navigate });
    });
  }

  private runAsyncCheckoutTask<T>(operationType: CheckoutTask, task: () => Promise<T>, beforeTask?: () => void) {
    // Noops during transitive state
    if (typeof BillingCheckout.clerk.user === 'undefined') {
      console.warn('Clerk: Checkout operations cannot be performed during transitive state');
      return { error: null };
    }
    return createRunAsyncCheckoutTask(this, this.signals, this.pendingOperations)(operationType, task, beforeTask);
  }
}

function createRunAsyncCheckoutTask(
  resource: CheckoutFlow,
  signals: CheckoutSignals,
  pendingOperations: Map<CheckoutTask, Promise<{ error: unknown }> | null>,
): <T>(
  operationType: CheckoutTask,
  task: () => Promise<T>,
  beforeTask?: () => void,
) => Promise<{ error: ClerkError | null }> {
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
