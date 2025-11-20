import { eventMethodCalled } from '../../telemetry/events';
import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import {
  useAssertWrappedByClerkProvider,
  useClerkInstanceContext,
  useOrganizationContext,
  useUserContext,
} from '../contexts';
import { useStatementQueryCacheKeys } from './useStatementQuery.shared';
import type { StatementQueryResult, UseStatementQueryParams } from './useStatementQuery.types';

const HOOK_NAME = 'useStatementQuery';

/**
 * This is the new implementation of useStatementQuery using React Query.
 * It is exported only if the package is built with the `CLERK_USE_RQ` environment variable set to `true`.
 *
 * @internal
 */
function useStatementQuery(params: UseStatementQueryParams = {}): StatementQueryResult {
  useAssertWrappedByClerkProvider(HOOK_NAME);

  const { statementId = null, enabled = true, keepPreviousData = false, for: forType = 'user' } = params;
  const clerk = useClerkInstanceContext();
  const user = useUserContext();
  const { organization } = useOrganizationContext();

  clerk.telemetry?.record(eventMethodCalled(HOOK_NAME));

  const organizationId = forType === 'organization' ? (organization?.id ?? null) : null;
  const userId = user?.id ?? null;

  const { queryKey } = useStatementQueryCacheKeys({
    statementId,
    userId,
    orgId: organizationId,
    for: forType,
  });

  const queryEnabled = Boolean(statementId) && enabled && (forType !== 'organization' || Boolean(organizationId));

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
