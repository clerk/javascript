import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useClerkInstanceContext, useOrganizationContext, useUserContext } from '../contexts';
import { useBillingHookEnabled } from './useBillingHookEnabled';
import { useStatementQueryCacheKeys } from './useStatementQuery.shared';
import type { StatementQueryResult, UseStatementQueryParams } from './useStatementQuery.types';

/**
 * @internal
 */
function useStatementQuery(params: UseStatementQueryParams = {}): StatementQueryResult {
  const { statementId = null, keepPreviousData = false, for: forType = 'user' } = params;
  const clerk = useClerkInstanceContext();
  const user = useUserContext();
  const { organization } = useOrganizationContext();

  const organizationId = forType === 'organization' ? (organization?.id ?? null) : null;
  const userId = user?.id ?? null;

  const { queryKey } = useStatementQueryCacheKeys({
    statementId,
    userId,
    orgId: organizationId,
    for: forType,
  });

  const billingEnabled = useBillingHookEnabled(params);

  const queryEnabled = Boolean(statementId) && billingEnabled;

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
