import { useState } from 'react';

import type { DirectorySyncStatusResource } from '@clerk/shared/types';

import { Badge, Button, Col, descriptors, Flex, localizationKeys, Text } from '@/customizables';
import { Alert } from '@/ui/elements/Alert';
import { handleError } from '@/utils/errorHandler';

type SyncNowRowProps = {
  status: DirectorySyncStatusResource | undefined;
  onSync: () => Promise<void>;
  onSynced: () => void;
};

const STATUS_COLOR_SCHEME = {
  succeeded: 'success',
  running: 'primary',
  failed: 'danger',
  cancelled: 'warning',
} as const;

/**
 * Starts a sync and reports how the last one went.
 *
 * A pull directory is read on a schedule, so without this the setup flow shows
 * an empty user list for minutes with no way to tell a slow sync from a broken
 * one.
 */
export const SyncNowRow = ({ status, onSync, onSynced }: SyncNowRowProps): JSX.Element => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const run = async (): Promise<void> => {
    if (isSyncing) {
      return;
    }
    setError(undefined);
    setIsSyncing(true);
    try {
      await onSync();
      onSynced();
    } catch (err) {
      // Includes the already-running case, which is a normal thing to hit by
      // clicking twice rather than a failure worth alarming about.
      handleError(err as Error, [], message => setError(typeof message === 'string' ? message : undefined));
    } finally {
      setIsSyncing(false);
    }
  };

  const lastStatus = status?.lastSyncStatus ?? null;

  return (
    <Col
      elementDescriptor={descriptors.configureDirectorySyncSyncRow}
      sx={t => ({
        gap: t.space.$3,
        padding: t.space.$4,
        borderRadius: t.radii.$md,
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$borderAlpha150,
      })}
    >
      <Flex
        align='center'
        justify='between'
        sx={t => ({ gap: t.space.$3 })}
      >
        <Col sx={t => ({ gap: t.space.$0x5 })}>
          <Flex
            align='center'
            sx={t => ({ gap: t.space.$2 })}
          >
            <Text
              as='span'
              localizationKey={localizationKeys('configureDirectorySync.testStep.syncRow.title')}
              sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$medium })}
            />
            {lastStatus && (
              <Badge
                elementDescriptor={descriptors.configureDirectorySyncStatusBadge}
                elementId={descriptors.configureDirectorySyncStatusBadge.setId(lastStatus)}
                colorScheme={STATUS_COLOR_SCHEME[lastStatus]}
                localizationKey={localizationKeys(`configureDirectorySync.testStep.syncStatus__${lastStatus}`)}
              />
            )}
          </Flex>
          <Text
            elementDescriptor={descriptors.configureDirectorySyncLastSyncedAt}
            as='span'
            colorScheme='secondary'
            sx={t => ({ fontSize: t.fontSizes.$sm })}
            localizationKey={
              status?.lastSyncedAt ? undefined : localizationKeys('configureDirectorySync.testStep.syncRow.neverSynced')
            }
          >
            {status?.lastSyncedAt ? status.lastSyncedAt.toLocaleString() : undefined}
          </Text>
        </Col>

        <Button
          elementDescriptor={descriptors.configureDirectorySyncSyncNowButton}
          variant='outline'
          size='sm'
          isLoading={isSyncing}
          onClick={() => void run()}
          localizationKey={localizationKeys('configureDirectorySync.testStep.actionLabel__syncNow')}
          sx={{ flexShrink: 0 }}
        />
      </Flex>

      {/* The provider's own failure message is the only thing that says what to
          fix in the Workspace setup, so it is shown rather than summarized. */}
      {status?.lastSyncError && (
        <Alert
          variant='danger'
          title={localizationKeys('configureDirectorySync.testStep.error__lastSyncFailed')}
          subtitle={status.lastSyncError}
        />
      )}

      {error && (
        <Alert
          variant='danger'
          title={error}
        />
      )}
    </Col>
  );
};
