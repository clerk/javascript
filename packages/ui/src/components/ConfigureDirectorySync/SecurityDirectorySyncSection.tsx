import {
  __internal_useOrganizationDirectorySync,
  __internal_useOrganizationEnterpriseConnections,
} from '@clerk/shared/react';
import { useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { handleError } from '@/utils/errorHandler';

import type { LocalizationKey } from '../../customizables';
import { Badge, Button, Col, Flex, localizationKeys, Text } from '../../customizables';
import { ResetConnectionDialog } from '../ConfigureSSO/ResetConnectionDialog';

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
  const { data: connections } = __internal_useOrganizationEnterpriseConnections();
  const connection = connections?.[0];
  const {
    data: directory,
    updateDirectorySync,
    deleteDirectorySync,
  } = __internal_useOrganizationDirectorySync({
    enterpriseConnectionId: connection?.id ?? null,
  });

  const status: DirectorySyncStatus = directory ? (directory.enabled ? 'active' : 'inactive') : 'unconfigured';
  const badge = STATUS_BADGES[status];

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.directorySyncSection.title')}
      id='directorySync'
      centered={false}
      badge={
        <Badge
          colorScheme={badge.colorScheme}
          localizationKey={badge.label}
        />
      }
    >
      {status === 'unconfigured' ? (
        <Col
          align='start'
          gap={4}
        >
          <Description />
          <Button
            variant='bordered'
            colorScheme='secondary'
            size='sm'
            onClick={onConfigure}
            localizationKey={localizationKeys(
              'organizationProfile.securityPage.directorySyncSection.primaryButton__startConfiguration',
            )}
          />
        </Col>
      ) : (
        <CardStateProvider>
          <ConfiguredContent
            isActive={status === 'active'}
            setActive={enabled => updateDirectorySync({ enabled })}
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
  setActive: (enabled: boolean) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onConfigure: () => void;
};

const ConfiguredContent = ({
  isActive,
  setActive,
  onDelete,
  organizationName,
  contentRef,
  onConfigure,
}: ConfiguredContentProps): JSX.Element => {
  const card = useCardState();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const onSetActive = async (enabled: boolean) => {
    if (card.isLoading) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      await setActive(enabled);
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
                  onClick: () => void onSetActive(false),
                }
              : {
                  label: localizationKeys('organizationProfile.securityPage.directorySyncSection.menuAction__activate'),
                  isDisabled: card.isLoading,
                  onClick: () => void onSetActive(true),
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
