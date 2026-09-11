import {
  __internal_useOrganizationDirectorySyncStatus,
  __internal_useOrganizationDirectorySyncUsers,
} from '@clerk/shared/react';
import type { DirectorySyncUserResource } from '@clerk/shared/types';

import {
  Badge,
  Button,
  Col,
  descriptors,
  Flex,
  localizationKeys,
  Spinner,
  Text,
  useLocalizations,
} from '@/customizables';
import { Alert } from '@/ui/elements/Alert';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import { useConfigureDirectorySync } from '../ConfigureDirectorySyncContext';
import { DIRECTORY_SYNC_PROVIDERS } from '../providerMeta';
import { SyncNowRow } from '../SyncNowRow';

const ProvisionedUserRow = ({ user }: { user: DirectorySyncUserResource }): JSX.Element => {
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ');

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
          {user.identifier || displayName || user.userId}
        </Text>
        {displayName && user.identifier && (
          <Text
            elementDescriptor={descriptors.configureDirectorySyncUserName}
            as='span'
            colorScheme='secondary'
            sx={t => ({ fontSize: t.fontSizes.$sm })}
          >
            {displayName}
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
            {user.provisionedAt.toLocaleString()}
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

export const TestSyncStep = (): JSX.Element => {
  const { goPrev } = useWizard();
  const { providerMeta, directory, onExit, syncDirectory } = useConfigureDirectorySync();
  const { t } = useLocalizations();
  const isPull = providerMeta?.mode === 'pull';
  // The list doubles as a live feed while the admin pushes test users from the
  // IdP, so poll for as long as this step is mounted.
  const users = __internal_useOrganizationDirectorySyncUsers({ directory, poll: true });
  // A pull directory has nothing to report until a run happens, and a run can
  // be minutes away, so the status is only worth watching for those.
  const syncStatus = __internal_useOrganizationDirectorySyncStatus({ directory, poll: isPull, enabled: isPull });

  const rows = users.data ?? [];
  const providerName = t((providerMeta ?? DIRECTORY_SYNC_PROVIDERS.custom).name);

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
              status={syncStatus.data}
              onSync={syncDirectory}
              onSynced={() => void syncStatus.revalidate()}
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

          {users.error ? (
            <Alert
              variant='danger'
              title={localizationKeys('configureDirectorySync.testStep.error__loadUsers')}
              subtitle={users.error.message}
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
              <Spinner
                elementDescriptor={descriptors.spinner}
                size='xs'
                colorScheme='neutral'
              />
              <Text
                as='span'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  isPull
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
