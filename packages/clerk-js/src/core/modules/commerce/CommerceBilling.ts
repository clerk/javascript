import type {
  ClerkPaginatedResponse,
  CommerceBillingNamespace,
  CommerceCheckoutJSON,
  CommercePaymentJSON,
  CommercePaymentResource,
  CommercePlanJSON,
  CommercePlanResource,
  CommerceProductJSON,
  CommerceStatementJSON,
  CommerceStatementResource,
  CommerceSubscriptionJSON,
  CommerceSubscriptionResource,
  CreateCheckoutParams,
  GetPaymentAttemptsParams,
  GetPlansParams,
  GetStatementsParams,
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
} from '../../resources/internal';

export class CommerceBilling implements CommerceBillingNamespace {
  getPlans = async (params?: GetPlansParams): Promise<CommercePlanResource[]> => {
    const { data: products } = (await BaseResource._fetch({
      path: `/commerce/products`,
      method: 'GET',
      search: { payerType: params?.subscriberType || '' },
    })) as unknown as ClerkPaginatedResponse<CommerceProductJSON>;

    const defaultProduct = products.find(product => product.is_default);
    return defaultProduct?.plans.map(plan => new CommercePlan(plan)) || [];
  };

  getPlan = async (params: { id: string }): Promise<CommercePlanResource> => {
    const plan = (await BaseResource._fetch({
      path: `/commerce/plans/${params.id}`,
      method: 'GET',
    })) as unknown as CommercePlanJSON;
    return new CommercePlan(plan);
  };

  getSubscriptions = async (
    params: GetSubscriptionsParams,
  ): Promise<ClerkPaginatedResponse<CommerceSubscriptionResource>> => {
    const { orgId, ...rest } = params;

    return await BaseResource._fetch({
      path: orgId ? `/organizations/${orgId}/commerce/subscriptions` : `/me/commerce/subscriptions`,
      method: 'GET',
      search: convertPageToOffsetSearchParams(rest),
    }).then(res => {
      const { data: subscriptions, total_count } =
        res?.response as unknown as ClerkPaginatedResponse<CommerceSubscriptionJSON>;

      return {
        total_count,
        data: subscriptions.map(subscription => new CommerceSubscription(subscription)),
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
