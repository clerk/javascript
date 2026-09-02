import { useCallback, useState } from 'react';

import type {
  DirectorySyncResource,
  DirectorySyncUserResource,
  GetDirectorySyncUsersParams,
} from '../../types/directorySync';
import { useClerkInstanceContext } from '../contexts';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useOrganizationDirectorySyncUsersCacheKeys } from './useOrganizationDirectorySync.shared';

const DEFAULT_POLL_INTERVAL_MS = 2_000;

export type UseOrganizationDirectorySyncUsersParams = {
  /** The directory to list users for, e.g. `data` from `useOrganizationDirectorySync`. Dormant while nullish. */
  directory: DirectorySyncResource | null | undefined;
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
  /** `undefined` while loading and while the hook is dormant. */
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
    directory,
    params: fetchParams = { initialPage: 1, pageSize: 10 },
    pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
    enabled = true,
    keepPreviousData = true,
  } = params;

  const clerk = useClerkInstanceContext();
  const organization = useOrganizationBase();
  const [queryClient] = useClerkQueryClient();
  const enterpriseConnectionId = directory?.enterpriseConnectionId ?? null;
  const directoryId = directory?.id ?? null;

  const { queryKey, invalidationKey, stableKey, authenticated } = useOrganizationDirectorySyncUsersCacheKeys({
    organizationId: organization?.id ?? null,
    enterpriseConnectionId,
    directoryId,
    args: fetchParams,
  });

  useClearQueriesOnSignOut({
    isSignedOut: organization === null,
    authenticated,
    stableKeys: stableKey,
  });

  const queryEnabled = enabled && clerk.loaded && Boolean(organization) && Boolean(directory);

  // Polling is armed for a specific directory and derived, not reset in an effect: a child
  // effect arming it in the same commit the directory arrives would otherwise be cancelled.
  const [armedForDirectoryId, setArmedForDirectoryId] = useState<string | null>(null);
  const shouldPoll = armedForDirectoryId !== null && armedForDirectoryId === directoryId;

  const currentTracked = queryKey[2];
  const query = useClerkQuery({
    queryKey,
    queryFn: () => {
      if (!directory) {
        throw new Error('directory is required to fetch directory users');
      }
      return directory.getUsers(fetchParams);
    },
    refetchInterval: () => (shouldPoll ? pollIntervalMs : false),
    enabled: queryEnabled,
    refetchIntervalInBackground: false,
    // Carry previous data only across pagination within the same organization
    // and directory — never across an identity change, where stale rows would
    // leak into the new context.
    placeholderData: keepPreviousData
      ? (previousData, previousQuery) => {
          const previousTracked = previousQuery?.queryKey[2];
          const sameIdentity =
            Boolean(currentTracked.organizationId) &&
            Boolean(currentTracked.directoryId) &&
            previousTracked?.organizationId === currentTracked.organizationId &&
            previousTracked?.directoryId === currentTracked.directoryId;
          return sameIdentity ? previousData : undefined;
        }
      : undefined,
  });

  const startPolling = useCallback(() => {
    setArmedForDirectoryId(directoryId);
  }, [directoryId]);

  const stopPolling = useCallback(() => {
    setArmedForDirectoryId(null);
  }, []);

  const revalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: invalidationKey });
  }, [queryClient, invalidationKey]);

  const isPolling = queryEnabled && shouldPoll;

  return {
    // Dormant means dormant: never surface cached rows while the query cannot run.
    data: queryEnabled ? query.data?.data : undefined,
    totalCount: queryEnabled ? query.data?.total_count : undefined,
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
