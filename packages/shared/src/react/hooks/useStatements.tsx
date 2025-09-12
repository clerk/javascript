import type { BillingStatementResource, GetStatementsParams } from '@clerk/types';

import { useClerkInstanceContext } from '../contexts';
import { createBillingPaginatedHook as createCommercePaginatedHook } from './createCommerceHook';

/**
 * @internal
 */
export const useStatements = createCommercePaginatedHook<BillingStatementResource, GetStatementsParams>({
  hookName: 'useStatements',
  resourceType: 'billing-statements',
  useFetcher: () => {
    const clerk = useClerkInstanceContext();
    if (clerk.loaded) {
      return clerk.billing.getStatements;
    }
    return undefined;
  },
});
