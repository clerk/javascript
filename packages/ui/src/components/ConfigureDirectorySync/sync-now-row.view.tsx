import { Badge, Button, Col, descriptors, Flex, localizationKeys, Text } from '@/customizables';
import { Alert } from '@/ui/elements/Alert';

import type { useSyncNowRowController } from './sync-now-row.controller';
import type { useSyncNowRowModel } from './sync-now-row.model';

const STATUS_COLOR_SCHEME = {
  succeeded: 'success',
  running: 'primary',
  failed: 'danger',
  cancelled: 'warning',
} as const;

export const SyncNowRowView = ({
  lastStatus,
  lastSyncedAt,
  lastSyncError,
  isSyncing,
  error,
  run,
}: Omit<ReturnType<typeof useSyncNowRowModel>, 'syncFailedMessage'> &
  ReturnType<typeof useSyncNowRowController>): JSX.Element => {
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
              lastSyncedAt ? undefined : localizationKeys('configureDirectorySync.testStep.syncRow.neverSynced')
            }
          >
            {lastSyncedAt}
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
      {lastSyncError && (
        <Alert
          variant='danger'
          title={localizationKeys('configureDirectorySync.testStep.error__lastSyncFailed')}
          subtitle={lastSyncError}
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
