import type { DirectorySyncStatusResource } from '@clerk/shared/types';

import { localizationKeys, useLocalizations } from '@/customizables';

export const useSyncNowRowModel = (
  status: Pick<DirectorySyncStatusResource, 'lastSyncStatus' | 'lastSyncedAt' | 'lastSyncError'> | undefined,
) => {
  const { t } = useLocalizations();
  return {
    lastStatus: status?.lastSyncStatus ?? null,
    lastSyncedAt: status?.lastSyncedAt ? status.lastSyncedAt.toLocaleString() : undefined,
    lastSyncError: status?.lastSyncError,
    syncFailedMessage: t(localizationKeys('configureDirectorySync.testStep.error__syncFailed')),
  };
};
