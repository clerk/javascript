import type {
  __experimental_CommerceBillingNamespace,
  __experimental_CommerceCheckoutJSON,
  __experimental_CommercePlanResource,
  __experimental_CommerceProductJSON,
  __experimental_CommerceSubscriptionJSON,
  __experimental_CommerceSubscriptionResource,
  __experimental_CreateCheckoutParams,
  __experimental_GetPlansParams,
  __experimental_GetSubscriptionsParams,
  ClerkPaginatedResponse,
} from '@clerk/types';

import { convertPageToOffsetSearchParams } from '../../../utils/convertPageToOffsetSearchParams';
import {
  __experimental_CommerceCheckout,
  __experimental_CommercePlan,
  __experimental_CommerceSubscription,
  BaseResource,
} from '../../resources/internal';

export class __experimental_CommerceBilling implements __experimental_CommerceBillingNamespace {
  getPlans = async (params?: __experimental_GetPlansParams): Promise<__experimental_CommercePlanResource[]> => {
    const { data: products } = (await BaseResource._fetch({
      path: `/commerce/products`,
      method: 'GET',
      search: { payerType: params?.subscriberType || '' },
    })) as unknown as ClerkPaginatedResponse<__experimental_CommerceProductJSON>;

    const defaultProduct = products.find(product => product.is_default);
    return defaultProduct?.plans.map(plan => new __experimental_CommercePlan(plan)) || [];
  };

  getSubscriptions = async (
    params: __experimental_GetSubscriptionsParams,
  ): Promise<ClerkPaginatedResponse<__experimental_CommerceSubscriptionResource>> => {
    const { orgId, ...rest } = params;

    return await BaseResource._fetch({
      path: orgId ? `/organizations/${orgId}/subscriptions` : `/me/commerce/subscriptions`,
      method: 'GET',
      search: convertPageToOffsetSearchParams(rest),
    }).then(res => {
      const { data: subscriptions, total_count } =
        res?.response as unknown as ClerkPaginatedResponse<__experimental_CommerceSubscriptionJSON>;

      return {
        total_count,
        data: subscriptions.map(subscription => new __experimental_CommerceSubscription(subscription)),
      };
    });
  };

  startCheckout = async (params: __experimental_CreateCheckoutParams) => {
    const { orgId, ...rest } = params;
    const json = (
      await BaseResource._fetch<__experimental_CommerceCheckoutJSON>({
        path: orgId ? `/organizations/${orgId}/commerce/checkouts` : `/me/commerce/checkouts`,
        method: 'POST',
        body: rest as any,
      })
    )?.response as unknown as __experimental_CommerceCheckoutJSON;

    return new __experimental_CommerceCheckout(json);
  };
}
