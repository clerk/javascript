import { __internal_useOrganizationDirectorySyncUsers } from '@clerk/shared/react';
import type { DirectorySyncUserResource } from '@clerk/shared/types';
import React from 'react';

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
  const { providerMeta, directory, onExit } = useConfigureDirectorySync();
  const { t } = useLocalizations();
  const users = __internal_useOrganizationDirectorySyncUsers({ directory });

  const rows = users.data ?? [];
  const providerName = t((providerMeta ?? DIRECTORY_SYNC_PROVIDERS.custom).name);

  // Poll while this step is visible; the list doubles as a live feed while the
  // admin pushes test users from the IdP. Unmounting the step ends the poll.
  const { startPolling } = users;
  React.useEffect(() => {
    startPolling();
  }, [startPolling]);

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
            localizationKey={localizationKeys('configureDirectorySync.testStep.description')}
          />

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
                localizationKey={localizationKeys('configureDirectorySync.testStep.empty__waitingForFirstUser')}
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
