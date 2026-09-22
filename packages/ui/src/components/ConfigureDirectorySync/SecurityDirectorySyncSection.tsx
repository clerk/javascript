import {
  __internal_useOrganizationDirectorySync,
  __internal_useOrganizationEnterpriseConnections,
} from '@clerk/shared/react';
import { useState } from 'react';

import { Alert } from '@/ui/elements/Alert';
import { Card } from '@/ui/elements/Card';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { handleError } from '@/utils/errorHandler';

import type { LocalizationKey } from '../../customizables';
import { Badge, Button, Col, descriptors, Flex, localizationKeys, Spinner, Text } from '../../customizables';
import { sortEnterpriseConnections } from '../ConfigureSSO/domain/organizationEnterpriseConnection';
import { ResetConnectionDialog } from '../ConfigureSSO/ResetConnectionDialog';
import { directorySyncProviderForConnection } from './providerMeta';

type SecurityDirectorySyncSectionProps = {
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onConfigure: () => void;
};

type DirectorySyncStatus = 'unconfigured' | 'active' | 'inactive';

const STATUS_BADGES: Record<
  DirectorySyncStatus,
  { colorScheme: 'primary' | 'success' | 'warning'; label: LocalizationKey }
> = {
  unconfigured: {
    colorScheme: 'primary',
    label: localizationKeys('organizationProfile.securityPage.directorySyncSection.badge__unconfigured'),
  },
  active: {
    colorScheme: 'success',
    label: localizationKeys('organizationProfile.securityPage.directorySyncSection.badge__active'),
  },
  inactive: {
    colorScheme: 'warning',
    label: localizationKeys('organizationProfile.securityPage.directorySyncSection.badge__inactive'),
  },
};

/**
 * The Directory Sync entry point on the organization Security page, rendered
 * beneath the SSO section.
 */
export const SecurityDirectorySyncSection = ({
  organizationName,
  contentRef,
  onConfigure,
}: SecurityDirectorySyncSectionProps): JSX.Element => {
  const {
    data: connections,
    isLoading: isLoadingConnections,
    error: connectionsError,
  } = __internal_useOrganizationEnterpriseConnections();
  const connection = sortEnterpriseConnections(connections ?? [])[0];
  const hasSsoConnection = Boolean(connection);
  const isGoogle = connection ? directorySyncProviderForConnection(connection.provider) === 'google' : false;
  const {
    data: directory,
    isLoading: isLoadingDirectory,
    error: directoryError,
    updateDirectorySync,
    deleteDirectorySync,
  } = __internal_useOrganizationDirectorySync({
    enterpriseConnectionId: connection?.id ?? null,
  });

  // The hook maps a 404 (no directory yet) to `data: null`, so any error here is unexpected.
  const isLoading = isLoadingConnections || (Boolean(connection) && isLoadingDirectory);
  const error = connectionsError ?? directoryError;
  const isSettled = !isLoading && !error;

  const status: DirectorySyncStatus = directory ? (directory.enabled ? 'active' : 'inactive') : 'unconfigured';
  const badge = STATUS_BADGES[status];

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.directorySyncSection.title')}
      id='directorySync'
      centered={false}
      badge={
        isSettled ? (
          <Badge
            colorScheme={badge.colorScheme}
            localizationKey={badge.label}
          />
        ) : undefined
      }
    >
      {isLoading ? (
        <Flex
          align='center'
          justify='center'
          sx={t => ({ paddingBlock: t.space.$5 })}
        >
          <Spinner
            size='xs'
            colorScheme='neutral'
            elementDescriptor={descriptors.spinner}
          />
        </Flex>
      ) : error ? (
        <Alert
          variant='danger'
          title={localizationKeys('organizationProfile.securityPage.directorySyncSection.error__load')}
          subtitle={error.message}
        />
      ) : status === 'unconfigured' ? (
        <Col
          align='start'
          gap={4}
        >
          <Description />
          {isGoogle ? (
            <Alert
              variant='warning'
              title={localizationKeys('configureDirectorySync.configureStep.warning__googleUnsupported.title')}
              subtitle={localizationKeys('configureDirectorySync.configureStep.warning__googleUnsupported.subtitle')}
            />
          ) : (
            <Flex
              align='center'
              gap={2}
            >
              <Button
                variant='bordered'
                colorScheme='secondary'
                size='sm'
                isDisabled={!hasSsoConnection}
                onClick={onConfigure}
                localizationKey={localizationKeys(
                  'organizationProfile.securityPage.directorySyncSection.primaryButton__startConfiguration',
                )}
              />
              {!hasSsoConnection && (
                <Badge
                  colorScheme='primary'
                  localizationKey={localizationKeys(
                    'organizationProfile.securityPage.directorySyncSection.badge__ssoRequired',
                  )}
                />
              )}
            </Flex>
          )}
        </Col>
      ) : (
        <CardStateProvider>
          <ConfiguredContent
            isActive={status === 'active'}
            updateEnabled={enabled => updateDirectorySync({ enabled })}
            onDelete={deleteDirectorySync}
            organizationName={organizationName}
            contentRef={contentRef}
            onConfigure={onConfigure}
          />
        </CardStateProvider>
      )}
    </ProfileSection.Root>
  );
};

type ConfiguredContentProps = {
  isActive: boolean;
  updateEnabled: (enabled: boolean) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onConfigure: () => void;
};

const ConfiguredContent = ({
  isActive,
  updateEnabled,
  onDelete,
  organizationName,
  contentRef,
  onConfigure,
}: ConfiguredContentProps): JSX.Element => {
  const card = useCardState();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const handleUpdateEnabled = async (enabled: boolean) => {
    if (card.isLoading) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      await updateEnabled(enabled);
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <Col gap={4}>
      <Flex
        align='start'
        justify='between'
        gap={3}
      >
        <Description />

        <ThreeDotsMenu
          elementId='directorySync'
          actions={[
            {
              label: localizationKeys('organizationProfile.securityPage.directorySyncSection.menuAction__edit'),
              onClick: onConfigure,
            },
            isActive
              ? {
                  label: localizationKeys(
                    'organizationProfile.securityPage.directorySyncSection.menuAction__deactivate',
                  ),
                  isDisabled: card.isLoading,
                  onClick: () => void handleUpdateEnabled(false),
                }
              : {
                  label: localizationKeys('organizationProfile.securityPage.directorySyncSection.menuAction__activate'),
                  isDisabled: card.isLoading,
                  onClick: () => void handleUpdateEnabled(true),
                },
            {
              label: localizationKeys('organizationProfile.securityPage.directorySyncSection.menuAction__remove'),
              isDestructive: true,
              onClick: () => setIsRemoveDialogOpen(true),
            },
          ]}
        />
      </Flex>

      <Card.Alert>{card.error}</Card.Alert>

      <ResetConnectionDialog
        isOpen={isRemoveDialogOpen}
        onClose={() => setIsRemoveDialogOpen(false)}
        confirmationValue={organizationName}
        title={localizationKeys('organizationProfile.securityPage.directorySyncSection.removeDialog.title')}
        subtitle={localizationKeys('organizationProfile.securityPage.directorySyncSection.removeDialog.subtitle')}
        confirmButtonLabel={localizationKeys(
          'organizationProfile.securityPage.directorySyncSection.removeDialog.confirmButton',
        )}
        onDelete={onDelete}
        contentRef={contentRef}
      />
    </Col>
  );
};

const Description = (): JSX.Element => (
  <Text
    as='p'
    colorScheme='secondary'
    localizationKey={localizationKeys('organizationProfile.securityPage.directorySyncSection.description')}
  />
);
