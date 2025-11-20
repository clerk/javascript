import { eventMethodCalled } from '../../telemetry/events';
import { useSWR } from '../clerk-swr';
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
 * This is the existing implementation of useStatementQuery using SWR.
 * It is kept here for backwards compatibility until our next major version.
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
