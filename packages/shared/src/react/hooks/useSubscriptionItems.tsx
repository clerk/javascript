import type { CommerceSubscriptionResource, GetSubscriptionsParams } from '@clerk/types';

import { useClerkInstanceContext } from '../contexts';
import { createCommerceHook } from './createCommerceHook';

/**
 * @interface
 */
export type UseSubscriptionItemsParams = Parameters<ReturnType<typeof createCommerceHook>>[0];

/**
 *
 */
export const useSubscriptionItems = createCommerceHook<CommerceSubscriptionResource, GetSubscriptionsParams>({
  hookName: 'useSubscriptionItems',
  resourceType: 'commerce-subscription-items',
  useFetcher: () => {
    const clerk = useClerkInstanceContext();
    return clerk.billing.getSubscriptions;
  },
});
