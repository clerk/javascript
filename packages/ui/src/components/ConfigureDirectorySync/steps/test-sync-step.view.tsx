import { Badge, Button, Col, descriptors, Flex, localizationKeys, Spinner, Text } from '@/customizables';
import { Alert } from '@/ui/elements/Alert';

import { Step } from '../../ConfigureSSO/elements/Step';
import { SyncNowRow } from '../SyncNowRow';
import type { useTestSyncStepController } from './test-sync-step.controller';
import type { useTestSyncStepModel } from './test-sync-step.model';

const ProvisionedUserRow = ({
  user,
}: {
  user: ReturnType<typeof useTestSyncStepModel>['rows'][number];
}): JSX.Element => {
  return (
    <Flex
      elementDescriptor={descriptors.configureDirectorySyncUsersRow}
      align='center'
      justify='between'
      sx={t => ({
        padding: `${t.space.$2x5} ${t.space.$4}`,
        borderBottomWidth: t.borderWidths.$normal,
        borderBottomStyle: t.borderStyles.$solid,
        borderBottomColor: t.colors.$borderAlpha100,
        '&:last-of-type': { borderBottom: 'none' },
      })}
    >
      <Col sx={t => ({ gap: t.space.$0x5 })}>
        <Text
          elementDescriptor={descriptors.configureDirectorySyncUserIdentifier}
          as='span'
          sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$medium })}
        >
          {user.identifier}
        </Text>
        {user.displayName && (
          <Text
            elementDescriptor={descriptors.configureDirectorySyncUserName}
            as='span'
            colorScheme='secondary'
            sx={t => ({ fontSize: t.fontSizes.$sm })}
          >
            {user.displayName}
          </Text>
        )}
      </Col>
      <Flex
        align='center'
        sx={t => ({ gap: t.space.$2 })}
      >
        {user.provisionedAt && (
          <Text
            elementDescriptor={descriptors.configureDirectorySyncUserTimestamp}
            as='span'
            colorScheme='secondary'
            sx={t => ({ fontSize: t.fontSizes.$xs })}
          >
            {user.provisionedAt}
          </Text>
        )}
        <Badge
          elementDescriptor={descriptors.configureDirectorySyncUserStatusBadge}
          elementId={descriptors.configureDirectorySyncUserStatusBadge.setId(user.active ? 'active' : 'deprovisioned')}
          colorScheme={user.active ? 'success' : 'danger'}
          localizationKey={localizationKeys(
            user.active
              ? 'configureDirectorySync.testStep.badge__active'
              : 'configureDirectorySync.testStep.badge__deprovisioned',
          )}
        />
      </Flex>
    </Flex>
  );
};

export const TestSyncStepView = ({
  isPull,
  rows,
  providerName,
  status,
  hasUsersError,
  usersError,
  syncDirectory,
  onExit,
  goPrev,
  isWaitingForUsers,
  onSynced,
  requestKey,
  canRun,
}: Pick<
  ReturnType<typeof useTestSyncStepModel>,
  | 'isPull'
  | 'rows'
  | 'providerName'
  | 'status'
  | 'hasUsersError'
  | 'usersError'
  | 'syncDirectory'
  | 'onExit'
  | 'requestKey'
  | 'canRun'
> &
  ReturnType<typeof useTestSyncStepController>): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureDirectorySync.testStep.title')}
        description={localizationKeys('configureDirectorySync.testStep.subtitle', { provider: providerName })}
      />

      <Step.Body>
        <Step.Section sx={t => ({ gap: t.space.$5 })}>
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={localizationKeys(
              isPull
                ? 'configureDirectorySync.testStep.description__pull'
                : 'configureDirectorySync.testStep.description',
            )}
          />

          {isPull && (
            <SyncNowRow
              status={status}
              onSync={syncDirectory}
              onSynced={onSynced}
              requestKey={requestKey}
              canRun={canRun}
            />
          )}

          <Text
            as='p'
            colorScheme='secondary'
          >
            <Text
              as='span'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureDirectorySync.testStep.noteLabel')}
              sx={t => ({ fontWeight: t.fontWeights.$medium })}
            />{' '}
            <Text
              as='span'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureDirectorySync.testStep.note')}
            />
          </Text>

          {hasUsersError ? (
            <Alert
              variant='danger'
              title={localizationKeys('configureDirectorySync.testStep.error__loadUsers')}
              subtitle={usersError}
            />
          ) : rows.length === 0 ? (
            <Flex
              elementDescriptor={descriptors.configureDirectorySyncUsersEmpty}
              align='center'
              justify='center'
              sx={t => ({
                gap: t.space.$2,
                padding: t.space.$8,
                borderRadius: t.radii.$md,
                borderWidth: t.borderWidths.$normal,
                borderStyle: 'dashed',
                borderColor: t.colors.$borderAlpha150,
              })}
            >
              {isWaitingForUsers && (
                <Spinner
                  elementDescriptor={descriptors.spinner}
                  size='xs'
                  colorScheme='neutral'
                />
              )}
              <Text
                as='span'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  !isWaitingForUsers
                    ? 'configureDirectorySync.testStep.empty__noUsersProvisioned'
                    : isPull
                      ? 'configureDirectorySync.testStep.empty__waitingForFirstSync'
                      : 'configureDirectorySync.testStep.empty__waitingForFirstUser',
                )}
              />
            </Flex>
          ) : (
            <Col
              elementDescriptor={descriptors.configureDirectorySyncUsersList}
              sx={t => ({
                borderRadius: t.radii.$md,
                borderWidth: t.borderWidths.$normal,
                borderStyle: t.borderStyles.$solid,
                borderColor: t.colors.$borderAlpha150,
                overflow: 'hidden',
              })}
            >
              {rows.map(user => (
                <ProvisionedUserRow
                  key={user.id}
                  user={user}
                />
              ))}
            </Col>
          )}
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Previous onClick={() => goPrev()} />
        <Button
          elementDescriptor={descriptors.configureDirectorySyncCompleteButton}
          variant='solid'
          size='sm'
          onClick={() => onExit?.()}
          localizationKey={localizationKeys('configureDirectorySync.testStep.actionLabel__complete')}
        />
      </Step.Footer>
    </>
  );
};
