import {
  __internal_useOrganizationDirectorySync,
  __internal_useOrganizationDirectorySyncStatus,
  __internal_useOrganizationDirectorySyncUsers,
  useOrganization,
} from '@clerk/shared/react';
import { useCallback, useEffect, useRef } from 'react';

import { useLocalizations } from '@/customizables';

import { useConfigureDirectorySync } from '../ConfigureDirectorySyncContext';
import { DIRECTORY_SYNC_PROVIDERS } from '../providerMeta';

export const useTestSyncStepModel = () => {
  const {
    providerMeta,
    enterpriseConnectionId,
    onExit,
    syncDirectory,
    directoryKey,
    canRun,
    canRunDirectory,
    directory: selectedDirectory,
  } = useConfigureDirectorySync();
  const { organization } = useOrganization();
  const { data: directoryData } = __internal_useOrganizationDirectorySync({ enterpriseConnectionId, enabled: false });
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const identity = JSON.stringify([
    directoryKey,
    selectedDirectory?.id,
    directoryData?.id,
    directoryData?.organizationId,
    directoryData?.enterpriseConnectionId,
    organization?.id,
    enterpriseConnectionId,
  ]);
  const scope = useRef({ identity, version: 0 });
  if (scope.current.identity !== identity) {
    scope.current = { identity, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const matchesSelection = Boolean(
    directoryData &&
    selectedDirectory &&
    organization &&
    directoryData.id === selectedDirectory.id &&
    directoryData.organizationId === organization.id &&
    directoryData.enterpriseConnectionId === enterpriseConnectionId,
  );
  const isCurrent = useCallback(
    () => mounted.current && scope.current.version === version && matchesSelection && canRun() && canRunDirectory(),
    [version, matchesSelection, canRun, canRunDirectory],
  );
  const canRead = isCurrent();
  const directory = canRead ? directoryData : undefined;
  const { t } = useLocalizations();
  const isPull = providerMeta?.mode === 'pull';
  // The list doubles as a live feed while the admin pushes test users from the
  // IdP, so poll for as long as this step is mounted.
  const users = __internal_useOrganizationDirectorySyncUsers({ directory });
  // A pull directory has nothing to report until a run happens, and a run can
  // be minutes away, so the status is only worth watching for those.
  const syncStatus = __internal_useOrganizationDirectorySyncStatus({ directory, enabled: isPull });
  const refreshes = useRef({ version, users: 0, status: 0 });
  if (refreshes.current.version !== version) {
    refreshes.current = { version, users: 0, status: 0 };
  }
  const runOwnedRequest = useCallback(
    async (request: () => Promise<void>, kind?: 'users' | 'status') => {
      if (!isCurrent()) {
        return;
      }
      const pending = refreshes.current;
      if (kind) {
        pending[kind]++;
      }
      try {
        await request();
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
      } finally {
        if (kind) {
          pending[kind]--;
        }
      }
    },
    [isCurrent],
  );
  const revalidateUsers = useCallback(
    () => runOwnedRequest(users.revalidate, 'users'),
    [runOwnedRequest, users.revalidate],
  );
  const revalidateStatus = useCallback(
    () => runOwnedRequest(syncStatus.revalidate, 'status'),
    [runOwnedRequest, syncStatus.revalidate],
  );
  const sync = useCallback(() => runOwnedRequest(syncDirectory), [runOwnedRequest, syncDirectory]);
  const fetching = useRef({ users: users.isFetching, status: syncStatus.isFetching });
  fetching.current = { users: users.isFetching, status: syncStatus.isFetching };
  useEffect(() => {
    if (!isCurrent()) {
      return;
    }
    const startPolling = (refresh: () => Promise<void>, isFetching: () => boolean) => {
      let active = true;
      let timer: ReturnType<typeof setTimeout>;
      const poll = () => {
        if (!active || !isCurrent()) {
          return;
        }
        timer = setTimeout(poll, 2_000);
        if (document.visibilityState !== 'hidden' && !isFetching()) {
          void refresh().catch(() => undefined);
        }
      };
      timer = setTimeout(poll, 2_000);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    };
    const stopUsers = startPolling(revalidateUsers, () => fetching.current.users || refreshes.current.users > 0);
    const stopStatus = isPull
      ? startPolling(revalidateStatus, () => fetching.current.status || refreshes.current.status > 0)
      : undefined;
    return () => {
      stopUsers();
      stopStatus?.();
    };
  }, [isCurrent, isPull, revalidateUsers, revalidateStatus]);
  const usersData = canRead ? users.data : undefined;
  const statusData = canRead ? syncStatus.data : undefined;
  const usersError = canRead ? users.error : null;

  const rows = (usersData ?? []).map(user => {
    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return {
      id: user.id,
      identifier: user.identifier || displayName || user.userId,
      displayName: displayName && user.identifier ? displayName : undefined,
      active: user.active,
      provisionedAt: user.provisionedAt?.toLocaleString(),
    };
  });
  const providerName = t((providerMeta ?? DIRECTORY_SYNC_PROVIDERS.custom).name);
  const status = statusData
    ? {
        lastSyncStatus: statusData.lastSyncStatus,
        lastSyncedAt: statusData.lastSyncedAt,
        lastSyncError: statusData.lastSyncError,
      }
    : undefined;

  return {
    requestKey: JSON.stringify([identity, version]),
    canRun: isCurrent,
    isPull,
    rows,
    providerName,
    status,
    lastSyncStatus: statusData?.lastSyncStatus ?? null,
    lastSyncedAt: statusData?.lastSyncedAt ?? null,
    changedUserCount: statusData?.lastSyncChangedUserCount ?? null,
    hasUsersError: Boolean(usersError),
    usersError: usersError?.message,
    revalidateUsers,
    revalidateStatus,
    syncDirectory: sync,
    onExit,
  };
};
