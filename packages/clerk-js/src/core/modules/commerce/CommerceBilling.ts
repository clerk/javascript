import type {
  ClerkPaginatedResponse,
  CommerceBillingNamespace,
  CommerceCheckoutJSON,
  CommerceInvoiceJSON,
  CommerceInvoiceResource,
  CommercePlanResource,
  CommerceProductJSON,
  CommerceSubscriptionJSON,
  CommerceSubscriptionResource,
  CreateCheckoutParams,
  GetInvoicesParams,
  GetPlansParams,
  GetSubscriptionsParams,
} from '@clerk/types';

import { convertPageToOffsetSearchParams } from '../../../utils/convertPageToOffsetSearchParams';
import {
  BaseResource,
  CommerceCheckout,
  CommerceInvoice,
  CommercePlan,
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

  getSubscriptions = async (
    params: GetSubscriptionsParams,
  ): Promise<ClerkPaginatedResponse<CommerceSubscriptionResource>> => {
    const { orgId, ...rest } = params;

    return await BaseResource._fetch({
      path: orgId ? `/organizations/${orgId}/subscriptions` : `/me/commerce/subscriptions`,
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

  getInvoices = async (params: GetInvoicesParams): Promise<ClerkPaginatedResponse<CommerceInvoiceResource>> => {
    const { orgId, ...rest } = params;

    return await BaseResource._fetch({
      path: orgId ? `/organizations/${orgId}/commerce/invoices` : `/me/commerce/invoices`,
      method: 'GET',
      search: convertPageToOffsetSearchParams(rest),
    }).then(res => {
      const { data: invoices, total_count } = res?.response as unknown as ClerkPaginatedResponse<CommerceInvoiceJSON>;

      return {
        total_count,
        data: invoices.map(invoice => new CommerceInvoice(invoice)),
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
