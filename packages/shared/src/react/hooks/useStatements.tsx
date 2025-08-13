import type { CommerceStatementResource, GetStatementsParams } from '@clerk/types';

import { useClerkInstanceContext } from '../contexts';
import { createCommercePaginatedHook } from './createCommerceHook';

/**
 * @internal
 */
export const useStatements = createCommercePaginatedHook<CommerceStatementResource, GetStatementsParams>({
  hookName: 'useStatements',
  resourceType: 'commerce-statements',
  useFetcher: () => {
    const clerk = useClerkInstanceContext();
    return clerk.billing.getStatements;
  },
});
