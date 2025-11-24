import type { BillingStatementResource, GetStatementsParams } from '../../types';
import { useClerkInstanceContext } from '../contexts';
import { STABLE_KEYS } from '../stable-keys';
import { createBillingPaginatedHook } from './createBillingPaginatedHook';

/**
 * @internal
 */
export const useStatements = createBillingPaginatedHook<BillingStatementResource, GetStatementsParams>({
  hookName: 'useStatements',
  resourceType: STABLE_KEYS.STATEMENTS_KEY,
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
