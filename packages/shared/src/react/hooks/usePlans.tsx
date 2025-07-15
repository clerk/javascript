import type { CommercePlanResource, GetPlansParams } from '@clerk/types';

import { useClerkInstanceContext } from '../contexts';
import { createCommerceHook } from './createCommerceHook';

/**
 * @internal
 */
export const usePlans = createCommerceHook<CommercePlanResource, GetPlansParams>({
  hookName: 'usePlans',
  resourceType: 'commerce-plans',
  useFetcher: _for => {
    const clerk = useClerkInstanceContext();
    return params => clerk.billing.getPlans({ ...params, for: _for === 'organization' ? 'org' : 'user' });
  },
});
