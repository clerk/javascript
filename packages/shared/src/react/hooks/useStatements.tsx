import type { BillingStatementResource, GetStatementsParams } from '@clerk/types';

import { useClerkInstanceContext } from '../contexts';
import { createBillingPaginatedHook } from './createBillingPaginatedHook';

/**
 *
 */
export const useStatements = createBillingPaginatedHook<BillingStatementResource, GetStatementsParams>({
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

/**
 * @interface
 */
export type UseStatementsReturn = ReturnType<typeof useStatements>;
