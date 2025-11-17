import type { BillingPlanResource, GetPlansParams } from '../../types';
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
    return params => clerk.billing.getPlans({ ...params, for: _for });
  },
  options: {
    unauthenticated: true,
  },
});

/**
 * @interface
 */
export type UsePlansReturn = ReturnType<typeof usePlans>;
