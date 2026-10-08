import type { DirectorySyncStatusResource } from '@clerk/shared/types';

import { useSyncNowRowController } from './sync-now-row.controller';
import { useSyncNowRowModel } from './sync-now-row.model';
import { SyncNowRowView } from './sync-now-row.view';

type SyncNowRowProps = {
  status: Pick<DirectorySyncStatusResource, 'lastSyncStatus' | 'lastSyncedAt' | 'lastSyncError'> | undefined;
  onSync: () => Promise<void>;
  onSynced: () => void;
  requestKey: string;
  canRun: () => boolean;
};

/**
 * Starts a sync and reports how the last one went.
 *
 * A pull directory is read on a schedule, so without this the setup flow shows
 * an empty user list for minutes with no way to tell a slow sync from a broken
 * one.
 */
export const SyncNowRow = ({ status, onSync, onSynced, requestKey, canRun }: SyncNowRowProps): JSX.Element => {
  const model = useSyncNowRowModel(status);
  const controller = useSyncNowRowController(onSync, onSynced, model.syncFailedMessage, { requestKey, canRun });
  return (
    <SyncNowRowView
      {...model}
      {...controller}
    />
  );
};
