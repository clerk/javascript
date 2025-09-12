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
} from '@clerk/types';

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
  getPlans = async (params?: GetPlansParams): Promise<ClerkPaginatedResponse<BillingPlanResource>> => {
    const { for: forParam, ...safeParams } = params || {};
    const searchParams = { ...safeParams, payer_type: forParam === 'organization' ? 'org' : 'user' };
    return await BaseResource._fetch({
      path: `/commerce/plans`,
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
      path: `/commerce/plans/${params.id}`,
      method: 'GET',
    })) as unknown as BillingPlanJSON;
    return new BillingPlan(plan);
  };

  getSubscription = async (params: GetSubscriptionParams): Promise<BillingSubscriptionResource> => {
    return await BaseResource._fetch({
      path: params.orgId ? `/organizations/${params.orgId}/commerce/subscription` : `/me/commerce/subscription`,
      method: 'GET',
    }).then(res => new BillingSubscription(res?.response as BillingSubscriptionJSON));
  };

  getStatements = async (params: GetStatementsParams): Promise<ClerkPaginatedResponse<BillingStatementResource>> => {
    const { orgId, ...rest } = params;

    return await BaseResource._fetch({
      path: orgId ? `/organizations/${orgId}/commerce/statements` : `/me/commerce/statements`,
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
        path: params.orgId
          ? `/organizations/${params.orgId}/commerce/statements/${params.id}`
          : `/me/commerce/statements/${params.id}`,
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
      path: orgId ? `/organizations/${orgId}/commerce/payment_attempts` : `/me/commerce/payment_attempts`,
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
      path: params.orgId
        ? `/organizations/${params.orgId}/commerce/payment_attempts/${params.id}`
        : `/me/commerce/payment_attempts/${params.id}`,
      method: 'GET',
    })) as unknown as BillingPaymentJSON;
    return new BillingPayment(paymentAttempt);
  };

  startCheckout = async (params: CreateCheckoutParams) => {
    const { orgId, ...rest } = params;
    const json = (
      await BaseResource._fetch<BillingCheckoutJSON>({
        path: orgId ? `/organizations/${orgId}/commerce/checkouts` : `/me/commerce/checkouts`,
        method: 'POST',
        body: rest as any,
      })
    )?.response as unknown as BillingCheckoutJSON;

    return new BillingCheckout(json);
  };
}
