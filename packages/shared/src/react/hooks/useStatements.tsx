import type { CommerceStatementResource, GetStatementsParams } from '@clerk/types';

import { useClerkInstanceContext } from '../contexts';
import { createCommerceHook } from './createCommerceHook';

/**
 * @internal
 */
export const useStatements = createCommerceHook<CommerceStatementResource, GetStatementsParams>({
  hookName: 'useStatements',
  resourceType: 'commerce-statements',
  useFetcher: () => {
    const clerk = useClerkInstanceContext();
    return clerk.billing.getStatements;
  },
});
