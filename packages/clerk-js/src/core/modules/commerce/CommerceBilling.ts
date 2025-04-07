import type {
  __experimental_CommerceBillingNamespace,
  __experimental_CommerceCheckoutJSON,
  __experimental_CommercePlanResource,
  __experimental_CommerceProductJSON,
  __experimental_CommerceSubscriptionJSON,
  __experimental_CommerceSubscriptionResource,
  __experimental_CreateCheckoutParams,
  __experimental_GetPlansParams,
  ClerkPaginatedResponse,
} from '@clerk/types';

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

  getSubscriptions = async (): Promise<ClerkPaginatedResponse<__experimental_CommerceSubscriptionResource>> => {
    return await BaseResource._fetch({
      path: `/me/subscriptions`,
      method: 'GET',
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
    const json = (
      await BaseResource._fetch<__experimental_CommerceCheckoutJSON>({
        path: `/me/commerce/checkouts`,
        method: 'POST',
        body: params as any,
      })
    )?.response as unknown as __experimental_CommerceCheckoutJSON;

    return new __experimental_CommerceCheckout(json);
  };
}
