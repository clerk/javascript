import { Alert } from '@/ui/elements/Alert';
import { Card } from '@/ui/elements/Card';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import type { ThemableCssProp } from '@/ui/styledSystem';

import type { LocalizationKey } from '../../customizables';
import { Badge, Col, descriptors, Flex, localizationKeys, Spinner, Text } from '../../customizables';
import { ResetConnectionDialog } from '../ConfigureSSO/ResetConnectionDialog';
import type { useConfiguredDirectorySyncController } from './security-directory-sync.controller';
import type { useSecurityDirectorySyncModel } from './security-directory-sync.model';
import { ConfiguredDirectorySyncStep } from './security-directory-sync.steps';

type DirectorySyncStatus = 'unconfigured' | 'active' | 'inactive';

const STATUS_BADGES: Record<
  Exclude<DirectorySyncStatus, 'unconfigured'>,
  { colorScheme: 'primary' | 'success' | 'warning'; label: LocalizationKey }
> = {
  active: {
    colorScheme: 'primary',
    label: localizationKeys('organizationProfile.securityPage.directorySyncSection.badge__active'),
  },
  inactive: {
    colorScheme: 'primary',
    label: localizationKeys('organizationProfile.securityPage.directorySyncSection.badge__inactive'),
  },
};

export const SecurityDirectorySyncView = ({
  model,
  onConfigure,
  organizationName,
  contentRef,
}: {
  model: ReturnType<typeof useSecurityDirectorySyncModel>;
  onConfigure: () => void;
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
}): JSX.Element => (
  <ProfileSection.Root
    title={localizationKeys('organizationProfile.securityPage.directorySyncSection.title')}
    id='directorySync'
    centered={false}
  >
    {model.isLoading ? (
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
    ) : model.hasError ? (
      <Alert
        variant='danger'
        title={localizationKeys('organizationProfile.securityPage.directorySyncSection.error__load')}
        subtitle={model.errorMessage}
      />
    ) : model.status === 'unconfigured' ? (
      <Col
        align='start'
        gap={2}
      >
        {!model.hasSsoConnection && (
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
            isDisabled={!model.hasSsoConnection}
            onClick={onConfigure}
            localizationKey={localizationKeys(
              'organizationProfile.securityPage.directorySyncSection.primaryButton__configure',
            )}
          />
          <Description sx={t => ({ paddingInlineStart: `calc(${t.space.$2x5} + ${t.sizes.$4} + ${t.space.$2})` })} />
        </Col>
      </Col>
    ) : (
      <ConfiguredDirectorySyncStep
        requestKey={model.requestKey}
        canRun={model.canRun}
        status={model.status}
        updateEnabled={model.updateEnabled}
        onDelete={model.onDelete}
        organizationName={organizationName}
        contentRef={contentRef}
        onConfigure={onConfigure}
      />
    )}
  </ProfileSection.Root>
);

export const ConfiguredDirectorySyncView = ({
  controller,
}: {
  controller: ReturnType<typeof useConfiguredDirectorySyncController>;
}): JSX.Element => {
  const badge = STATUS_BADGES[controller.isActive ? 'active' : 'inactive'];

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
              onClick: controller.onConfigure,
            },
            controller.isActive
              ? {
                  label: localizationKeys(
                    'organizationProfile.securityPage.directorySyncSection.menuAction__deactivate',
                  ),
                  isDisabled: controller.isLoading,
                  onClick: () => void controller.updateEnabled(false),
                }
              : {
                  label: localizationKeys('organizationProfile.securityPage.directorySyncSection.menuAction__activate'),
                  isDisabled: controller.isLoading,
                  onClick: () => void controller.updateEnabled(true),
                },
            {
              label: localizationKeys('organizationProfile.securityPage.directorySyncSection.menuAction__remove'),
              isDestructive: true,
              onClick: controller.openRemoveDialog,
            },
          ]}
        />
      </Flex>

      <Card.Alert>{controller.error}</Card.Alert>

      <ResetConnectionDialog
        requestKey={controller.requestKey}
        canRun={controller.canRun}
        isOpen={controller.isRemoveDialogOpen}
        onClose={controller.closeRemoveDialog}
        confirmationValue={controller.organizationName}
        title={localizationKeys('organizationProfile.securityPage.directorySyncSection.removeDialog.title')}
        subtitle={localizationKeys('organizationProfile.securityPage.directorySyncSection.removeDialog.subtitle')}
        confirmButtonLabel={localizationKeys(
          'organizationProfile.securityPage.directorySyncSection.removeDialog.confirmButton',
        )}
        onDelete={controller.onDelete}
        contentRef={controller.contentRef}
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
