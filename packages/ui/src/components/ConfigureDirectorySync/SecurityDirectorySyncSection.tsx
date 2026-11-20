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
import type { ThemableCssProp } from '@/ui/styledSystem';
import { getAPIErrorMessage, handleError } from '@/utils/errorHandler';

import type { LocalizationKey } from '../../customizables';
import { Badge, Col, descriptors, Flex, localizationKeys, Spinner, Text } from '../../customizables';
import { sortEnterpriseConnections } from '../ConfigureSSO/domain/organizationEnterpriseConnection';
import { ResetConnectionDialog } from '../ConfigureSSO/ResetConnectionDialog';

type SecurityDirectorySyncSectionProps = {
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onConfigure: () => void;
};

type DirectorySyncStatus = 'unconfigured' | 'in_progress' | 'active' | 'inactive';
type ConfiguredDirectorySyncStatus = Exclude<DirectorySyncStatus, 'unconfigured'>;

const STATUS_BADGES: Record<
  ConfiguredDirectorySyncStatus,
  { colorScheme: 'primary' | 'success' | 'warning'; label: LocalizationKey }
> = {
  in_progress: {
    colorScheme: 'primary',
    label: localizationKeys('organizationProfile.securityPage.directorySyncSection.badge__inProgress'),
  },
  active: {
    colorScheme: 'primary',
    label: localizationKeys('organizationProfile.securityPage.directorySyncSection.badge__active'),
  },
  inactive: {
    colorScheme: 'primary',
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

  // A pull directory (Google Workspace) exists before its credentials do and
  // cannot be enabled until they are stored, so that outranks the enabled flag,
  // as in the SSO section. Push providers get `null` here: not applicable.
  const status: DirectorySyncStatus = !directory
    ? 'unconfigured'
    : directory.credentialsConfigured === false
      ? 'in_progress'
      : directory.enabled
        ? 'active'
        : 'inactive';

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.directorySyncSection.title')}
      id='directorySync'
      centered={false}
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
          subtitle={getAPIErrorMessage(error)}
        />
      ) : status === 'unconfigured' ? (
        <Col
          align='start'
          gap={2}
        >
          {!hasSsoConnection && (
            <Badge
              colorScheme='primary'
              localizationKey={localizationKeys(
                'organizationProfile.securityPage.directorySyncSection.badge__ssoRequired',
              )}
            />
          )}
          <Col sx={{ width: '100%' }}>
            <ProfileSection.ArrowButton
              id='directorySync'
              isDisabled={!hasSsoConnection}
              onClick={onConfigure}
              localizationKey={localizationKeys(
                'organizationProfile.securityPage.directorySyncSection.primaryButton__configure',
              )}
            />
            <Description sx={t => ({ paddingInlineStart: `calc(${t.space.$2x5} + ${t.sizes.$4} + ${t.space.$2})` })} />
          </Col>
        </Col>
      ) : (
        <CardStateProvider>
          <ConfiguredContent
            status={status}
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
  status: ConfiguredDirectorySyncStatus;
  updateEnabled: (enabled: boolean) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onConfigure: () => void;
};

const ConfiguredContent = ({
  status,
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

  const badge = STATUS_BADGES[status];

  return (
    <Col gap={4}>
      <Flex
        align='center'
        justify='between'
        gap={3}
      >
        <Badge
          colorScheme={badge.colorScheme}
          localizationKey={badge.label}
        />

        <ThreeDotsMenu
          elementId='directorySync'
          actions={[
            {
              label: localizationKeys('organizationProfile.securityPage.directorySyncSection.menuAction__edit'),
              onClick: onConfigure,
            },
            // Activate is only offered where it can succeed: the server refuses
            // it for an in-progress directory until the credentials are stored.
            ...(status === 'active'
              ? [
                  {
                    label: localizationKeys(
                      'organizationProfile.securityPage.directorySyncSection.menuAction__deactivate',
                    ),
                    isDisabled: card.isLoading,
                    onClick: () => void handleUpdateEnabled(false),
                  },
                ]
              : []),
            ...(status === 'inactive'
              ? [
                  {
                    label: localizationKeys(
                      'organizationProfile.securityPage.directorySyncSection.menuAction__activate',
                    ),
                    isDisabled: card.isLoading,
                    onClick: () => void handleUpdateEnabled(true),
                  },
                ]
              : []),
            {
              label: localizationKeys('organizationProfile.securityPage.directorySyncSection.menuAction__remove'),
              isDestructive: true,
              onClick: () => setIsRemoveDialogOpen(true),
            },
          ]}
        />
      </Flex>

      {status === 'in_progress' && (
        <Col sx={{ width: '100%' }}>
          <ProfileSection.ArrowButton
            id='directorySync'
            onClick={onConfigure}
            localizationKey={localizationKeys(
              'organizationProfile.securityPage.directorySyncSection.primaryButton__continueConfiguration',
            )}
          />
          <Description sx={t => ({ paddingInlineStart: `calc(${t.space.$2x5} + ${t.sizes.$4} + ${t.space.$2})` })} />
        </Col>
      )}

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

const Description = ({ sx }: { sx?: ThemableCssProp }): JSX.Element => (
  <Text
    as='p'
    colorScheme='secondary'
    sx={sx}
    localizationKey={localizationKeys('organizationProfile.securityPage.directorySyncSection.description')}
  />
);
