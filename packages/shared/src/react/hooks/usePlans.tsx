import type { BillingPlanResource, GetPlansParams } from '@clerk/types';

import { useClerkInstanceContext } from '../contexts';
import { createBillingPaginatedHook } from './createBillingPaginatedHook';

/**
 * @internal
 */
export const usePlans = createBillingPaginatedHook<BillingPlanResource, GetPlansParams>({
  hookName: 'usePlans',
  resourceType: 'billing-plans',
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

/**
 * @interface
 */
export type UsePlansReturn = ReturnType<typeof usePlans>;
