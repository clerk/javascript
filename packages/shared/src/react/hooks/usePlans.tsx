import type { CommercePlanResource, GetPlansParams } from '@clerk/types';

import { useClerkInstanceContext } from '../contexts';
import { createCommercePaginatedHook } from './createCommerceHook';

/**
 * @internal
 */
export const usePlans = createCommercePaginatedHook<CommercePlanResource, GetPlansParams>({
  hookName: 'usePlans',
  resourceType: 'commerce-plans',
  useFetcher: _for => {
    const clerk = useClerkInstanceContext();
    if (!clerk.loaded) {
      return undefined;
    }
    return ({ orgId, ...rest }) => {
      // Cleanup `orgId` from the params
      return clerk.billing.getPlans({ ...rest, for: _for });
    };
  },
  options: {
    unauthenticated: true,
  },
});
