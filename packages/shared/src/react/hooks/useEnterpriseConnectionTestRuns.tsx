import { useCallback, useEffect, useState } from 'react';

import type {
  EnterpriseConnectionTestRunResource,
  GetEnterpriseConnectionTestRunsParams,
} from '../../types/enterpriseConnectionTestRun';
import { useClerkInstanceContext } from '../contexts';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { useUserBase } from './base/useUserBase';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useEnterpriseConnectionTestRunsCacheKeys } from './useEnterpriseConnectionTestRuns.shared';

const DEFAULT_POLL_INTERVAL_MS = 2_000;

export type UseEnterpriseConnectionTestRunsParams = {
  enterpriseConnectionId: string | null;
  /**
   * Pass-through fetch parameters (pagination, status filter).
   * Defaults to `{ initialPage: 1, pageSize: 10 }`.
   */
  params?: GetEnterpriseConnectionTestRunsParams;
  /**
   * Polling interval (ms) applied between `revalidate()` and the moment the
   * first record arrives in the response.
   *
   * @default 2000
   */
  pollIntervalMs?: number;
  /**
   * If `false`, the hook is dormant — no fetch, no polling.
   *
   * @default true
   */
  enabled?: boolean;
};

export type UseEnterpriseConnectionTestRunsReturn = {
  data: EnterpriseConnectionTestRunResource[] | undefined;
  /** Convenience accessor for the most recent run (i.e. `data[0]`). */
  latest: EnterpriseConnectionTestRunResource | undefined;
  totalCount: number | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  /**
   * `true` while the hook is actively polling for the first record to appear.
   * Becomes `true` once `revalidate()` is called against an empty list and
   * flips back to `false` permanently as soon as the response contains at
   * least one record.
   */
  isPolling: boolean;
  /**
   * Force a refetch and (if the list is currently empty) arm polling. Once any
   * record has been observed in the response, polling is disabled for the rest
   * of this hook instance's lifetime — subsequent `revalidate()` calls just
   * trigger a single refetch.
   */
  revalidate: () => Promise<void>;
};

/**
 * Subscribes to the list of enterprise-connection test runs for the signed-in user
 *
 * @internal
 */
function useEnterpriseConnectionTestRuns(
  params: UseEnterpriseConnectionTestRunsParams,
): UseEnterpriseConnectionTestRunsReturn {
  const {
    enterpriseConnectionId,
    params: fetchParams = { initialPage: 1, pageSize: 10 },
    pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
    enabled = true,
  } = params;

  const clerk = useClerkInstanceContext();
  const user = useUserBase();
  const [queryClient] = useClerkQueryClient();

  const { queryKey, stableKey, authenticated } = useEnterpriseConnectionTestRunsCacheKeys({
    userId: user?.id ?? null,
    enterpriseConnectionId,
    args: fetchParams,
  });

  useClearQueriesOnSignOut({
    isSignedOut: user === null,
    authenticated,
    stableKeys: stableKey,
  });

  const queryEnabled = enabled && clerk.loaded && Boolean(user) && Boolean(enterpriseConnectionId);

  const [shouldPoll, setShouldPoll] = useState(false);

  const query = useClerkQuery({
    queryKey,
    queryFn: () => {
      if (!enterpriseConnectionId) {
        throw new Error('enterpriseConnectionId is required to fetch test runs');
      }
      return user?.getEnterpriseConnectionTestRuns(enterpriseConnectionId, fetchParams);
    },
    enabled: queryEnabled,
    refetchInterval: q => {
      if (!shouldPoll) {
        return false;
      }

      const hasRows = (q.state.data?.data?.length ?? 0) > 0;
      return hasRows ? false : pollIntervalMs;
    },
  });

  const hasRows = (query.data?.data?.length ?? 0) > 0;

  useEffect(() => {
    if (shouldPoll && hasRows) {
      setShouldPoll(false);
    }
  }, [shouldPoll, hasRows]);

  const revalidate = useCallback(async () => {
    // Only arm polling when there is nothing in the list yet — once any record
    // has been seen, this is a one-shot refetch.
    if (!hasRows) {
      setShouldPoll(true);
    }
    await queryClient.invalidateQueries({ queryKey: [stableKey] });
  }, [queryClient, stableKey, hasRows]);

  const isPolling = queryEnabled && shouldPoll && !hasRows;

  return {
    data: query.data?.data,
    latest: query.data?.data?.[0],
    totalCount: query.data?.total_count,
    error: query.error ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPolling,
    revalidate,
  };
}

export { useEnterpriseConnectionTestRuns as __internal_useEnterpriseConnectionTestRuns };
