import { useCallback, useEffect, useState } from 'react';

import type {
  EnterpriseConnectionTestRunResource,
  GetEnterpriseConnectionTestRunsParams,
} from '../../types/enterpriseConnectionTestRun';
import { useClerkInstanceContext } from '../contexts';
import { defineKeepPreviousDataFn } from '../query/keep-previous-data';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useOrganizationEnterpriseConnectionTestRunsCacheKeys } from './useOrganizationEnterpriseConnectionTestRuns.shared';

const DEFAULT_POLL_INTERVAL_MS = 2_000;

export type UseOrganizationEnterpriseConnectionTestRunsParams = {
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
  /**
   * When `true`, a background refetch keeps the previously-loaded page visible
   * (`isFetching` stays `true`, `isLoading` does not flip back to `true`) instead
   * of clearing to a cold-load state. Mirrors the `keepPreviousData` option on
   * `__internal_useOrganizationEnterpriseConnections` so paginating an
   * existing-at-load list never tears the surrounding UI down to a skeleton.
   *
   * @default false
   */
  keepPreviousData?: boolean;
};

export type UseOrganizationEnterpriseConnectionTestRunsReturn = {
  data: EnterpriseConnectionTestRunResource[] | undefined;
  totalCount: number | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  /**
   * `true` while the hook is actively polling for the first record to appear
   */
  isPolling: boolean;
  /**
   * Force a refetch.
   *
   * By default this also arms polling when the list is currently empty, so a run
   * kicked off elsewhere is picked up as it lands. Pass `{ armPolling: false }`
   * for an entry/pagination refetch that should never arm polling merely because
   * the list happens to be empty — polling is then armed only by an explicit
   * `revalidate()` (or `revalidate({ armPolling: true })`) after a run is kicked
   * off.
   */
  revalidate: (options?: RevalidateTestRunsOptions) => Promise<void>;
};

export type RevalidateTestRunsOptions = {
  /**
   * Whether to arm polling for the first record when the list is currently
   * empty.
   *
   * @default true
   */
  armPolling?: boolean;
};

/**
 * Subscribes to the list of enterprise-connection test runs for the active organization
 *
 * @internal
 */
function useOrganizationEnterpriseConnectionTestRuns(
  params: UseOrganizationEnterpriseConnectionTestRunsParams,
): UseOrganizationEnterpriseConnectionTestRunsReturn {
  const {
    enterpriseConnectionId,
    params: fetchParams = { initialPage: 1, pageSize: 10 },
    pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
    enabled = true,
    keepPreviousData = false,
  } = params;

  const clerk = useClerkInstanceContext();
  const organization = useOrganizationBase();
  const [queryClient] = useClerkQueryClient();

  const { queryKey, invalidationKey, stableKey, authenticated } = useOrganizationEnterpriseConnectionTestRunsCacheKeys({
    organizationId: organization?.id ?? null,
    enterpriseConnectionId,
    args: fetchParams,
  });

  useClearQueriesOnSignOut({
    isSignedOut: organization === null,
    authenticated,
    stableKeys: stableKey,
  });

  const queryEnabled = enabled && clerk.loaded && Boolean(organization) && Boolean(enterpriseConnectionId);

  const [shouldPoll, setShouldPoll] = useState(false);

  const query = useClerkQuery({
    queryKey,
    queryFn: () => {
      if (!enterpriseConnectionId) {
        throw new Error('enterpriseConnectionId is required to fetch test runs');
      }
      return organization?.getEnterpriseConnectionTestRuns(enterpriseConnectionId, fetchParams);
    },
    refetchInterval: q => {
      if (!shouldPoll) {
        return false;
      }

      const hasRows = (q.state.data?.data?.length ?? 0) > 0;
      return hasRows ? false : pollIntervalMs;
    },
    enabled: queryEnabled,
    refetchIntervalInBackground: false,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData),
  });

  const hasRows = (query.data?.data?.length ?? 0) > 0;

  useEffect(() => {
    if (shouldPoll && hasRows) {
      setShouldPoll(false);
    }
  }, [shouldPoll, hasRows]);

  const revalidate = useCallback(
    async (options?: RevalidateTestRunsOptions) => {
      // Arm polling only when the caller opts in (the default) AND there is
      // nothing in the list yet. An entry/pagination refetch passes
      // `armPolling: false` so an empty list on entry never arms polling on its
      // own — that stays the job of an explicit refetch after a run is kicked
      // off. Once any record has been seen, this is a one-shot refetch.
      const armPolling = options?.armPolling ?? true;
      if (armPolling && !hasRows) {
        setShouldPoll(true);
      }
      await queryClient.invalidateQueries({ queryKey: invalidationKey });
    },
    [queryClient, invalidationKey, hasRows],
  );

  const isPolling = queryEnabled && shouldPoll && !hasRows;

  return {
    data: query.data?.data,
    totalCount: query.data?.total_count,
    error: query.error ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPolling,
    revalidate,
  };
}

export { useOrganizationEnterpriseConnectionTestRuns as __internal_useOrganizationEnterpriseConnectionTestRuns };
