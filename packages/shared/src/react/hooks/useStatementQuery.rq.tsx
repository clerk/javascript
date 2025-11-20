import { eventMethodCalled } from '../../telemetry/events';
import { useClerkQuery } from '../clerk-rq/useQuery';
import {
  useAssertWrappedByClerkProvider,
  useClerkInstanceContext,
  useOrganizationContext,
  useUserContext,
} from '../contexts';
import type { StatementQueryResult, UseStatementQueryParams } from './useStatementQuery.types';
import { useStatementQueryCacheKeys } from './useStatementQuery.shared';

const HOOK_NAME = 'useStatementQuery';

/**
 * @internal
 */
function KeepPreviousDataFn<Data>(previousData: Data): Data {
  return previousData;
}

/**
 * This is the new implementation of useStatementQuery using React Query.
 * It is exported only if the package is built with the `CLERK_USE_RQ` environment variable set to `true`.
 *
 * @internal
 */
export function __internal_useStatementQuery(params: UseStatementQueryParams = {}): StatementQueryResult {
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
    placeholderData: keepPreviousData ? KeepPreviousDataFn : undefined,
    staleTime: 1_000 * 60,
  });

  return {
    data: query.data,
    error: (query.error ?? null) as StatementQueryResult['error'],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}
