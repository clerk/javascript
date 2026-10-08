import type React from 'react';

import { Card } from '@/ui/elements/Card';
import { CardStateProvider } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { Tooltip } from '@/ui/elements/Tooltip';
import type { ThemableCssProp } from '@/ui/styledSystem';

import { Badge, Button, Col, descriptors, Flex, Icon, localizationKeys, Text } from '../../customizables';
import { InformationCircle } from '../../icons';
import { ResetConnectionDialog } from '../ConfigureSSO/ResetConnectionDialog';
import { EnterpriseConnectionIcon } from './EnterpriseConnectionIcon';
import type { useSecuritySsoConnectionRowController } from './security-sso-section.controller';
import type { useSsoInfoTooltipModel } from './security-sso-section.model';
import type { ConnectionRowProps, SecuritySsoSectionProps } from './security-sso-section.types';

type SecuritySsoSectionViewProps = SecuritySsoSectionProps & {
  onAddConnection: () => void;
  ConnectionRow: React.ComponentType<ConnectionRowProps>;
  SsoInfoTooltip: React.ComponentType;
};

export const SecuritySsoSectionView = ({
  ConnectionRow,
  SsoInfoTooltip,
  enterpriseConnections,
  enterpriseConnectionMutations,
  organizationName,
  contentRef,
  onConfigure,
  onOpenConnection,
  onAddConnection,
  ownerKey,
  canRun,
}: SecuritySsoSectionViewProps): JSX.Element => {
  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.ssoSection.title')}
      id='sso'
      centered={false}
      badge={<SsoInfoTooltip />}
    >
      <Col gap={4}>
        {enterpriseConnections.length > 0 && (
          <ProfileSection.ItemList id='sso'>
            {enterpriseConnections.map(connection => (
              <CardStateProvider key={JSON.stringify([ownerKey, connection.id])}>
                <ConnectionRow
                  ownerKey={ownerKey}
                  canRun={canRun}
                  connection={connection}
                  enterpriseConnectionMutations={enterpriseConnectionMutations}
                  organizationName={organizationName}
                  contentRef={contentRef}
                  onConfigure={onConfigure}
                  onOpenConnection={onOpenConnection}
                />
              </CardStateProvider>
            ))}
          </ProfileSection.ItemList>
        )}

        <Col sx={{ width: '100%' }}>
          {onConfigure && (
            <ProfileSection.ArrowButton
              id='sso'
              elementDescriptor={[
                descriptors.profileSectionPrimaryButton,
                descriptors.organizationProfileSecuritySsoConfigureButton,
              ]}
              localizationKey={
                enterpriseConnections.length === 0
                  ? localizationKeys('organizationProfile.securityPage.ssoSection.primaryButton__configure')
                  : localizationKeys('organizationProfile.securityPage.ssoSection.primaryButton__addConnection')
              }
              onClick={onAddConnection}
            />
          )}
          <SsoDescription
            sx={
              onConfigure
                ? t => ({ paddingInlineStart: `calc(${t.space.$2x5} + ${t.sizes.$4} + ${t.space.$2})` })
                : undefined
            }
          />
        </Col>
      </Col>
    </ProfileSection.Root>
  );
};

export const SecuritySsoConnectionRowView = ({
  preview,
  organizationName,
  contentRef,
  badge,
  label,
  actions,
  error,
  isRemoveDialogOpen,
  onCloseRemoveDialog,
  onDelete,
  requestKey,
  canRun,
}: ReturnType<typeof useSecuritySsoConnectionRowController>): JSX.Element => {
  return (
    <Col
      elementDescriptor={descriptors.organizationProfileSecuritySsoConnectionRow}
      gap={2}
      sx={{ width: '100%' }}
    >
      <ProfileSection.Item id='sso'>
        <Flex
          align='center'
          sx={t => ({ minWidth: 0, flex: 1, gap: t.space.$3 })}
        >
          <Flex
            align='center'
            justify='center'
            sx={t => ({
              flexShrink: 0,
              width: t.sizes.$10,
              height: t.sizes.$10,
              borderRadius: t.radii.$md,
              borderWidth: t.borderWidths.$normal,
              borderStyle: t.borderStyles.$solid,
              borderColor: t.colors.$borderAlpha150,
              backgroundColor: t.colors.$colorBackground,
            })}
          >
            <EnterpriseConnectionIcon
              connection={preview}
              size='$6'
            />
          </Flex>

          <Col sx={{ minWidth: 0 }}>
            <Text as='span'>{preview.name}</Text>
            {preview.domains.length > 0 ? (
              <Text
                as='span'
                colorScheme='secondary'
                variant='caption'
                sx={{ overflowWrap: 'anywhere' }}
              >
                {preview.domains.join(', ')}
              </Text>
            ) : (
              label && (
                <Text
                  as='span'
                  colorScheme='secondary'
                  variant='caption'
                  localizationKey={label}
                />
              )
            )}
          </Col>
        </Flex>

        <Flex
          align='center'
          sx={t => ({ gap: t.space.$2 })}
        >
          <Badge
            elementDescriptor={descriptors.organizationProfileSecuritySsoBadge}
            elementId={descriptors.organizationProfileSecuritySsoBadge.setId(badge.id)}
            colorScheme={badge.colorScheme}
            localizationKey={badge.label}
          />

          {actions && (
            <ThreeDotsMenu
              elementId='sso'
              actions={actions}
            />
          )}
        </Flex>
      </ProfileSection.Item>

      <Card.Alert>{error}</Card.Alert>

      {actions && (
        <ResetConnectionDialog
          requestKey={requestKey}
          canRun={canRun}
          isOpen={isRemoveDialogOpen}
          onClose={onCloseRemoveDialog}
          confirmationValue={organizationName}
          title={localizationKeys('organizationProfile.securityPage.removeDialog.title')}
          subtitle={localizationKeys('organizationProfile.securityPage.removeDialog.subtitle', {
            name: preview.name,
          })}
          confirmButtonLabel={localizationKeys('organizationProfile.securityPage.removeDialog.confirmButton')}
          onDelete={onDelete}
          contentRef={contentRef}
        />
      )}
    </Col>
  );
};

const SsoDescription = ({ sx }: { sx?: ThemableCssProp }): JSX.Element => (
  <Text
    as='p'
    elementDescriptor={descriptors.organizationProfileSecuritySsoDescription}
    colorScheme='secondary'
    sx={sx}
    localizationKey={localizationKeys('organizationProfile.securityPage.ssoSection.descriptionLine1')}
  />
);

export const SsoInfoTooltipView = ({ roleName, label }: ReturnType<typeof useSsoInfoTooltipModel>): JSX.Element => {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger>
        <Button
          variant='unstyled'
          aria-label={label}
          sx={t => ({
            display: 'inline-flex',
            alignItems: 'center',
            padding: 0,
            height: 'fit-content',
            borderRadius: t.radii.$sm,
            color: t.colors.$colorMutedForeground,
          })}
        >
          <Icon
            icon={InformationCircle}
            aria-hidden
            sx={t => ({ width: t.sizes.$4, height: t.sizes.$4 })}
          />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content
        text={
          roleName
            ? localizationKeys('organizationProfile.securityPage.ssoSection.tooltip', { role: roleName })
            : localizationKeys('organizationProfile.securityPage.ssoSection.tooltip__noRole')
        }
      />
    </Tooltip.Root>
  );
};
