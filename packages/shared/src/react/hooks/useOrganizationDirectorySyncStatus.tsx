import { useCallback } from 'react';

import type { DirectorySyncResource, DirectorySyncStatusResource } from '../../types/directorySync';
import { useClerkInstanceContext } from '../contexts';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useOrganizationDirectorySyncStatusCacheKeys } from './useOrganizationDirectorySync.shared';

const DEFAULT_POLL_INTERVAL_MS = 2_000;

export type UseOrganizationDirectorySyncStatusParams = {
  /** The directory to read status for, e.g. `data` from `useOrganizationDirectorySync`. Nothing is fetched while `null` or `undefined`. */
  directory: DirectorySyncResource | null | undefined;
  /**
   * Poll for changes while `true`. Tie this to the view that needs the live
   * status so polling stops when that view goes away.
   *
   * @default false
   */
  poll?: boolean;
  /**
   * Polling interval (ms) used while `poll` is `true`.
   *
   * @default 2000
   */
  pollIntervalMs?: number;
  /**
   * If `false`, nothing is fetched and polling is paused.
   *
   * @default true
   */
  enabled?: boolean;
};

export type UseOrganizationDirectorySyncStatusReturn = {
  /** `undefined` while loading and while the hook is disabled. Every field is `null` before the first sync completes. */
  data: DirectorySyncStatusResource | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  /** `true` while the hook is polling. */
  isPolling: boolean;
  revalidate: () => Promise<void>;
};

/**
 * The result of a Directory Sync directory's most recent sync.
 *
 * Only pull-based directories sync, so this stays dormant for push providers,
 * which are driven by the identity provider and have no sync to report.
 *
 * @internal
 */
function useOrganizationDirectorySyncStatus(
  params: UseOrganizationDirectorySyncStatusParams,
): UseOrganizationDirectorySyncStatusReturn {
  const { directory, poll = false, pollIntervalMs = DEFAULT_POLL_INTERVAL_MS, enabled = true } = params;

  const clerk = useClerkInstanceContext();
  const organization = useOrganizationBase();
  const [queryClient] = useClerkQueryClient();
  const enterpriseConnectionId = directory?.enterpriseConnectionId ?? null;
  const directoryId = directory?.id ?? null;

  const { queryKey, invalidationKey, stableKey, authenticated } = useOrganizationDirectorySyncStatusCacheKeys({
    organizationId: organization?.id ?? null,
    enterpriseConnectionId,
    directoryId,
  });

  useClearQueriesOnSignOut({
    isSignedOut: organization === null,
    authenticated,
    stableKeys: stableKey,
  });

  const queryEnabled = enabled && clerk.loaded && Boolean(organization) && Boolean(directory);

  const query = useClerkQuery({
    queryKey,
    queryFn: () => {
      if (!directory) {
        throw new Error('directory is required to fetch sync status');
      }
      return directory.getSyncStatus();
    },
    refetchInterval: () => (poll ? pollIntervalMs : false),
    enabled: queryEnabled,
    refetchIntervalInBackground: false,
    // No placeholderData: a stale run result shown against a different directory
    // would misreport whether that directory has ever synced.
  });

  const revalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: invalidationKey });
  }, [queryClient, invalidationKey]);

  return {
    // A disabled query still exposes whatever is cached under its key; report none until it can run.
    data: queryEnabled ? query.data : undefined,
    error: query.error ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPolling: queryEnabled && poll,
    revalidate,
  };
}

export { useOrganizationDirectorySyncStatus as __internal_useOrganizationDirectorySyncStatus };
