import type {
  BillingCheckoutJSON,
  BillingNamespace,
  BillingPaymentJSON,
  BillingPaymentResource,
  BillingPlanJSON,
  BillingPlanResource,
  BillingStatementJSON,
  BillingStatementResource,
  BillingSubscriptionJSON,
  BillingSubscriptionResource,
  ClerkPaginatedResponse,
  CreateCheckoutParams,
  GetPaymentAttemptsParams,
  GetPlansParams,
  GetStatementsParams,
  GetSubscriptionParams,
} from '@clerk/shared/types';

import { convertPageToOffsetSearchParams } from '../../../utils/convertPageToOffsetSearchParams';
import {
  BaseResource,
  BillingCheckout,
  BillingPayment,
  BillingPlan,
  BillingStatement,
  BillingSubscription,
} from '../../resources/internal';

export class Billing implements BillingNamespace {
  static readonly #pathRoot = '/billing';
  static path(subPath: string, param?: { orgId?: string | null }): string {
    const { orgId } = param || {};
    const prefix = orgId ? `/organizations/${orgId}` : '/me';
    return `${prefix}${Billing.#pathRoot}${subPath}`;
  }

  getPlans = async (params?: GetPlansParams): Promise<ClerkPaginatedResponse<BillingPlanResource>> => {
    const { for: forParam, ...safeParams } = params || {};
    const searchParams = { ...safeParams, payer_type: forParam === 'organization' ? 'org' : 'user' };
    return await BaseResource._fetch({
      path: `${Billing.#pathRoot}/plans`,
      method: 'GET',
      search: convertPageToOffsetSearchParams(searchParams),
    }).then(res => {
      const { data: plans, total_count } = res as unknown as ClerkPaginatedResponse<BillingPlanJSON>;

      return {
        total_count,
        data: plans.map(plan => new BillingPlan(plan)),
      };
    });
  };

  // Inconsistent API
  getPlan = async (params: { id: string }): Promise<BillingPlanResource> => {
    const plan = (await BaseResource._fetch({
      path: `${Billing.#pathRoot}/plans/${params.id}`,
      method: 'GET',
    })) as unknown as BillingPlanJSON;
    return new BillingPlan(plan);
  };

  getSubscription = async (params: GetSubscriptionParams): Promise<BillingSubscriptionResource> => {
    return await BaseResource._fetch({
      path: Billing.path(`/subscription`, { orgId: params.orgId }),
      method: 'GET',
    }).then(res => new BillingSubscription(res?.response as BillingSubscriptionJSON));
  };

  getStatements = async (params: GetStatementsParams): Promise<ClerkPaginatedResponse<BillingStatementResource>> => {
    const { orgId, ...rest } = params;

    return await BaseResource._fetch({
      path: Billing.path(`/statements`, { orgId }),
      method: 'GET',
      search: convertPageToOffsetSearchParams(rest),
    }).then(res => {
      const { data: statements, total_count } =
        res?.response as unknown as ClerkPaginatedResponse<BillingStatementJSON>;

      return {
        total_count,
        data: statements.map(statement => new BillingStatement(statement)),
      };
    });
  };

  getStatement = async (params: { id: string; orgId?: string }): Promise<BillingStatementResource> => {
    const statement = (
      await BaseResource._fetch({
        path: Billing.path(`/statements/${params.id}`, { orgId: params.orgId }),
        method: 'GET',
      })
    )?.response as unknown as BillingStatementJSON;
    return new BillingStatement(statement);
  };

  getPaymentAttempts = async (
    params: GetPaymentAttemptsParams,
  ): Promise<ClerkPaginatedResponse<BillingPaymentResource>> => {
    const { orgId, ...rest } = params;

    return await BaseResource._fetch({
      path: Billing.path(`/payment_attempts`, { orgId }),
      method: 'GET',
      search: convertPageToOffsetSearchParams(rest),
    }).then(res => {
      const { data: payments, total_count } = res as unknown as ClerkPaginatedResponse<BillingPaymentJSON>;

      return {
        total_count,
        data: payments.map(payment => new BillingPayment(payment)),
      };
    });
  };

  getPaymentAttempt = async (params: { id: string; orgId?: string }): Promise<BillingPaymentResource> => {
    const paymentAttempt = (await BaseResource._fetch({
      path: Billing.path(`/payment_attempts/${params.id}`, { orgId: params.orgId }),
      method: 'GET',
    })) as unknown as BillingPaymentJSON;
    return new BillingPayment(paymentAttempt);
  };

  startCheckout = async (params: CreateCheckoutParams) => {
    const { orgId, ...rest } = params;
    const json = (
      await BaseResource._fetch<BillingCheckoutJSON>({
        path: Billing.path(`/checkouts`, { orgId }),
        method: 'POST',
        body: rest as any,
      })
    )?.response as unknown as BillingCheckoutJSON;

    return new BillingCheckout(json);
  };
}
