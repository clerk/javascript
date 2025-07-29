import type {
  ClerkPaginatedResponse,
  CommerceBillingNamespace,
  CommerceCheckoutJSON,
  CommercePaymentJSON,
  CommercePaymentResource,
  CommercePlanJSON,
  CommercePlanResource,
  CommerceStatementJSON,
  CommerceStatementResource,
  CommerceSubscriptionItemJSON,
  CommerceSubscriptionItemResource,
  CommerceSubscriptionJSON,
  CommerceSubscriptionResource,
  CreateCheckoutParams,
  GetPaymentAttemptsParams,
  GetPlansParams,
  GetStatementsParams,
  GetSubscriptionParams,
  GetSubscriptionsParams,
} from '@clerk/types';

import { convertPageToOffsetSearchParams } from '../../../utils/convertPageToOffsetSearchParams';
import {
  BaseResource,
  CommerceCheckout,
  CommercePayment,
  CommercePlan,
  CommerceStatement,
  CommerceSubscription,
  CommerceSubscriptionItem,
} from '../../resources/internal';

export class CommerceBilling implements CommerceBillingNamespace {
  getPlans = async (params?: GetPlansParams): Promise<ClerkPaginatedResponse<CommercePlanResource>> => {
    const { for: forParam, ...safeParams } = params || {};
    const searchParams = { ...safeParams, payer_type: forParam === 'organization' ? 'org' : 'user' };
    return await BaseResource._fetch({
      path: `/commerce/plans`,
      method: 'GET',
      search: convertPageToOffsetSearchParams(searchParams),
    }).then(res => {
      const { data: plans, total_count } = res as unknown as ClerkPaginatedResponse<CommercePlanJSON>;

      return {
        total_count,
        data: plans.map(plan => new CommercePlan(plan)),
      };
    });
  };

  // Inconsistent API
  getPlan = async (params: { id: string }): Promise<CommercePlanResource> => {
    const plan = (await BaseResource._fetch({
      path: `/commerce/plans/${params.id}`,
      method: 'GET',
    })) as unknown as CommercePlanJSON;
    return new CommercePlan(plan);
  };

  getSubscription = async (params: GetSubscriptionParams): Promise<CommerceSubscriptionResource> => {
    return await BaseResource._fetch({
      path: params.orgId ? `/organizations/${params.orgId}/commerce/subscription` : `/me/commerce/subscription`,
      method: 'GET',
    }).then(res => new CommerceSubscription(res?.response as CommerceSubscriptionJSON));
  };

  getSubscriptions = async (
    params: GetSubscriptionsParams,
  ): Promise<ClerkPaginatedResponse<CommerceSubscriptionItemResource>> => {
    const { orgId, ...rest } = params;

    return await BaseResource._fetch({
      path: orgId ? `/organizations/${orgId}/commerce/subscriptions` : `/me/commerce/subscriptions`,
      method: 'GET',
      search: convertPageToOffsetSearchParams(rest),
    }).then(res => {
      const { data: subscriptions, total_count } =
        res?.response as unknown as ClerkPaginatedResponse<CommerceSubscriptionItemJSON>;

      return {
        total_count,
        data: subscriptions.map(subscription => new CommerceSubscriptionItem(subscription)),
      };
    });
  };

  getStatements = async (params: GetStatementsParams): Promise<ClerkPaginatedResponse<CommerceStatementResource>> => {
    const { orgId, ...rest } = params;

    return await BaseResource._fetch({
      path: orgId ? `/organizations/${orgId}/commerce/statements` : `/me/commerce/statements`,
      method: 'GET',
      search: convertPageToOffsetSearchParams(rest),
    }).then(res => {
      const { data: statements, total_count } =
        res?.response as unknown as ClerkPaginatedResponse<CommerceStatementJSON>;

      return {
        total_count,
        data: statements.map(statement => new CommerceStatement(statement)),
      };
    });
  };

  getPaymentAttempts = async (
    params: GetPaymentAttemptsParams,
  ): Promise<ClerkPaginatedResponse<CommercePaymentResource>> => {
    const { orgId, ...rest } = params;

    return await BaseResource._fetch({
      path: orgId ? `/organizations/${orgId}/commerce/payment_attempts` : `/me/commerce/payment_attempts`,
      method: 'GET',
      search: convertPageToOffsetSearchParams(rest),
    }).then(res => {
      const { data: payments, total_count } = res as unknown as ClerkPaginatedResponse<CommercePaymentJSON>;

      return {
        total_count,
        data: payments.map(payment => new CommercePayment(payment)),
      };
    });
  };

  startCheckout = async (params: CreateCheckoutParams) => {
    const { orgId, ...rest } = params;
    const json = (
      await BaseResource._fetch<CommerceCheckoutJSON>({
        path: orgId ? `/organizations/${orgId}/commerce/checkouts` : `/me/commerce/checkouts`,
        method: 'POST',
        body: rest as any,
      })
    )?.response as unknown as CommerceCheckoutJSON;

    return new CommerceCheckout(json, orgId);
  };
}
