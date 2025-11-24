import type { BillingPlanResource, GetPlansParams } from '../../types';
import { useClerkInstanceContext } from '../contexts';
import { STABLE_KEYS } from '../stable-keys';
import { createBillingPaginatedHook } from './createBillingPaginatedHook';

/**
 * @internal
 */
export const usePlans = createBillingPaginatedHook<BillingPlanResource, GetPlansParams>({
  hookName: 'usePlans',
  resourceType: STABLE_KEYS.PLANS_KEY,
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
