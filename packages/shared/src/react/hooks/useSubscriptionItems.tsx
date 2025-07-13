import type { CommerceSubscriptionResource, GetSubscriptionsParams } from '@clerk/types';

import { useClerkInstanceContext } from '../contexts';
import { createCommerceHook } from './createCommerceHook';

/**
 * @internal
 */
export const useSubscriptionItems = createCommerceHook<CommerceSubscriptionResource, GetSubscriptionsParams>({
  hookName: 'useSubscriptionItems',
  resourceType: 'commerce-subscription-items',
  useFetcher: () => {
    const clerk = useClerkInstanceContext();
    return clerk.billing.getSubscriptions;
  },
});
