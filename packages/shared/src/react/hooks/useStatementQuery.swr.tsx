import { useSWR } from '../clerk-swr';
import { useClerkInstanceContext, useOrganizationContext, useUserContext } from '../contexts';
import { useStatementQueryCacheKeys } from './useStatementQuery.shared';
import type { StatementQueryResult, UseStatementQueryParams } from './useStatementQuery.types';

/**
 * This is the existing implementation of useStatementQuery using SWR.
 * It is kept here for backwards compatibility until our next major version.
 *
 * @internal
 */
export function __internal_useStatementQuery(params: UseStatementQueryParams = {}): StatementQueryResult {
  const { statementId = null, enabled = true, keepPreviousData = false, for: forType = 'user' } = params;
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

  const queryEnabled = Boolean(statementId) && enabled && (forType !== 'organization' || Boolean(organizationId));

  const swr = useSWR(
    queryEnabled ? queryKey : null,
    () => {
      if (!statementId) {
        throw new Error('statementId is required to fetch a statement');
      }
      return clerk.billing.getStatement({ id: statementId, orgId: organizationId ?? undefined });
    },
    {
      dedupingInterval: 1_000 * 60,
      keepPreviousData,
    },
  );

  return {
    data: swr.data,
    error: (swr.error ?? null) as StatementQueryResult['error'],
    isLoading: swr.isLoading,
    isFetching: swr.isValidating,
  };
}
