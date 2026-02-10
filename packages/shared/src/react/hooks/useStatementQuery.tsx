import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useClerkInstanceContext } from '../contexts';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useUserBase } from './base/useUserBase';
import { useBillingIsEnabled } from './useBillingIsEnabled';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useStatementQueryCacheKeys } from './useStatementQuery.shared';
import type { StatementQueryResult, UseStatementQueryParams } from './useStatementQuery.types';

/**
 * @internal
 */
function useStatementQuery(params: UseStatementQueryParams = {}): StatementQueryResult {
  const { statementId = null, keepPreviousData = false, for: forType = 'user' } = params;
  const clerk = useClerkInstanceContext();
  const user = useUserBase();
  const organization = useOrganizationBase();

  const organizationId = forType === 'organization' ? (organization?.id ?? null) : null;
  const userId = user?.id ?? null;

  const { queryKey, stableKey, authenticated } = useStatementQueryCacheKeys({
    statementId,
    userId,
    orgId: organizationId,
    for: forType,
  });

  const billingEnabled = useBillingIsEnabled(params);

  const queryEnabled = Boolean(statementId) && billingEnabled;

  useClearQueriesOnSignOut({
    isSignedOut: user === null,
    authenticated,
    stableKeys: stableKey,
  });

  const query = useClerkQuery({
    queryKey,
    queryFn: () => {
      if (!statementId) {
        throw new Error('statementId is required to fetch a statement');
      }
      return clerk.billing.getStatement({ id: statementId, orgId: organizationId ?? undefined });
    },
    enabled: queryEnabled,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData),
    staleTime: 1_000 * 60,
  });

  return {
    data: query.data,
    error: (query.error ?? null) as StatementQueryResult['error'],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}

export { useStatementQuery as __internal_useStatementQuery };
