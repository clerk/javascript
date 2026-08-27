import { useCallback, useEffect, useState } from 'react';

import type { DirectorySyncUserResource, GetDirectorySyncUsersParams } from '../../types/directorySync';
import { useClerkInstanceContext } from '../contexts';
import { defineKeepPreviousDataFn } from '../query/keep-previous-data';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useOrganizationDirectorySyncUsersCacheKeys } from './useOrganizationDirectorySync.shared';

const DEFAULT_POLL_INTERVAL_MS = 2_000;

export type UseOrganizationDirectorySyncUsersParams = {
  enterpriseConnectionId: string | null;
  /**
   * Pass-through fetch parameters (pagination).
   * Defaults to `{ initialPage: 1, pageSize: 10 }`.
   */
  params?: GetDirectorySyncUsersParams;
  /**
   * Polling interval (ms) applied while polling is armed via `startPolling`.
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
  keepPreviousData?: boolean;
};

export type UseOrganizationDirectorySyncUsersReturn = {
  data: DirectorySyncUserResource[] | undefined;
  totalCount: number | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  /**
   * `true` while the hook is actively polling
   */
  isPolling: boolean;
  /**
   * Start polling. Polling runs continuously (new provisions, updates, and
   * deprovisions keep appearing) until `stopPolling` is called — callers
   * should stop on unmount of the view that armed it.
   */
  startPolling: () => void;
  /**
   * Stop polling.
   */
  stopPolling: () => void;
  /**
   * Force a refetch.
   */
  revalidate: () => Promise<void>;
};

/**
 * The users provisioned into an enterprise connection's Directory Sync
 * directory, most recently touched first. Polls continuously while armed via
 * `startPolling`, so the setup flow doubles as a recent-activity feed.
 *
 * @internal
 */
function useOrganizationDirectorySyncUsers(
  params: UseOrganizationDirectorySyncUsersParams,
): UseOrganizationDirectorySyncUsersReturn {
  const {
    enterpriseConnectionId,
    params: fetchParams = { initialPage: 1, pageSize: 10 },
    pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
    enabled = true,
    keepPreviousData = true,
  } = params;

  const clerk = useClerkInstanceContext();
  const organization = useOrganizationBase();
  const [queryClient] = useClerkQueryClient();

  const { queryKey, invalidationKey, stableKey, authenticated } = useOrganizationDirectorySyncUsersCacheKeys({
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

  useEffect(() => {
    // Polling intent is scoped to the current connection — clear it when the
    // connection changes so a reset/recreate doesn't inherit a stale armed poll.
    setShouldPoll(false);
  }, [enterpriseConnectionId]);

  const query = useClerkQuery({
    queryKey,
    queryFn: () => {
      if (!enterpriseConnectionId) {
        throw new Error('enterpriseConnectionId is required to fetch directory users');
      }
      return organization?.getDirectorySyncUsers(enterpriseConnectionId, fetchParams);
    },
    refetchInterval: () => (shouldPoll ? pollIntervalMs : false),
    enabled: queryEnabled,
    refetchIntervalInBackground: false,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData),
  });

  const startPolling = useCallback(() => {
    setShouldPoll(true);
  }, []);

  const stopPolling = useCallback(() => {
    setShouldPoll(false);
  }, []);

  const revalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: invalidationKey });
  }, [queryClient, invalidationKey]);

  const isPolling = queryEnabled && shouldPoll;

  return {
    data: query.data?.data,
    totalCount: query.data?.total_count,
    error: query.error ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPolling,
    startPolling,
    stopPolling,
    revalidate,
  };
}

export { useOrganizationDirectorySyncUsers as __internal_useOrganizationDirectorySyncUsers };
