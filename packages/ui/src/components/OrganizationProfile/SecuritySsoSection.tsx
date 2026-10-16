import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import { useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { Tooltip } from '@/ui/elements/Tooltip';
import type { ThemableCssProp } from '@/ui/styledSystem';
import { handleError } from '@/utils/errorHandler';

import { useEnvironment } from '../../contexts';
import {
  Badge,
  Button,
  Col,
  descriptors,
  Flex,
  Icon,
  localizationKeys,
  Text,
  useLocalizations,
} from '../../customizables';
import { useFetchRoles, useLocalizeCustomRoles } from '../../hooks/useFetchRoles';
import { InformationCircle } from '../../icons';
import type { ConnectionScope } from '../ConfigureSSO/domain/connectionScope';
import { providerLabel, toProviderCard } from '../ConfigureSSO/domain/providers';
import type { EnterpriseConnectionMutations } from '../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import { useOrganizationEnterpriseConnectionStatus } from '../ConfigureSSO/hooks/useOrganizationEnterpriseConnectionStatus';
import { ResetConnectionDialog } from '../ConfigureSSO/ResetConnectionDialog';
import type { EnterpriseConnectionProviderType } from '../ConfigureSSO/types';
import { EnterpriseConnectionIcon } from './EnterpriseConnectionIcon';
import { STATUS_BADGES } from './enterpriseConnectionStatusBadges';

type SecuritySsoSectionProps = {
  enterpriseConnections: EnterpriseConnectionResource[];
  enterpriseConnectionMutations: EnterpriseConnectionMutations;
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onConfigure?: (scope: ConnectionScope, forceInitialStep?: boolean) => void;
  onOpenConnection?: (id: string) => void;
};

export const SecuritySsoSection = ({
  enterpriseConnections,
  enterpriseConnectionMutations,
  organizationName,
  contentRef,
  onConfigure,
  onOpenConnection,
}: SecuritySsoSectionProps): JSX.Element => {
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
              <CardStateProvider key={connection.id}>
                <ConnectionRow
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
              onClick={() => onConfigure({ kind: 'new' }, true)}
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

type ConnectionRowProps = Omit<SecuritySsoSectionProps, 'enterpriseConnections'> & {
  connection: EnterpriseConnectionResource;
};

const ConnectionRow = ({
  connection,
  enterpriseConnectionMutations: { setConnectionActive, deleteConnection },
  organizationName,
  contentRef,
  onConfigure,
  onOpenConnection,
}: ConnectionRowProps): JSX.Element => {
  const card = useCardState();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const { status } = useOrganizationEnterpriseConnectionStatus(connection, { probe: false });

  const badge = STATUS_BADGES[status];
  const label = providerLabel(toProviderCard(connection.provider as EnterpriseConnectionProviderType));

  const onSetActive = async (active: boolean) => {
    if (card.isLoading) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      await setConnectionActive(connection.id, active);
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  const actions =
    onConfigure && onOpenConnection
      ? [
          {
            label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__edit'),
            onClick: () => onOpenConnection(connection.id),
          },
          ...(status === 'in_progress'
            ? [
                {
                  label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__continue'),
                  onClick: () => onConfigure({ kind: 'existing', id: connection.id }),
                },
              ]
            : []),
          ...(status === 'active'
            ? [
                {
                  label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__deactivate'),
                  isDisabled: card.isLoading,
                  onClick: () => void onSetActive(false),
                },
              ]
            : []),
          ...(status === 'inactive'
            ? [
                {
                  label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__activate'),
                  isDisabled: card.isLoading,
                  onClick: () => void onSetActive(true),
                },
              ]
            : []),
          {
            label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__remove'),
            isDestructive: true,
            onClick: () => setIsRemoveDialogOpen(true),
          },
        ]
      : undefined;

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
              connection={connection}
              size='$6'
            />
          </Flex>

          <Col sx={{ minWidth: 0 }}>
            <Text as='span'>{connection.name}</Text>
            {connection.domains.length > 0 ? (
              <Text
                as='span'
                colorScheme='secondary'
                variant='caption'
                sx={{ overflowWrap: 'anywhere' }}
              >
                {connection.domains.join(', ')}
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

      <Card.Alert>{card.error}</Card.Alert>

      {actions && (
        <ResetConnectionDialog
          isOpen={isRemoveDialogOpen}
          onClose={() => setIsRemoveDialogOpen(false)}
          confirmationValue={organizationName}
          title={localizationKeys('organizationProfile.securityPage.removeDialog.title')}
          subtitle={localizationKeys('organizationProfile.securityPage.removeDialog.subtitle', {
            name: connection.name,
          })}
          confirmButtonLabel={localizationKeys('organizationProfile.securityPage.removeDialog.confirmButton')}
          onDelete={() => deleteConnection(connection.id)}
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

const SsoInfoTooltip = (): JSX.Element => {
  const roleName = useEnrollmentRoleName();
  const { t } = useLocalizations();

  return (
    <Tooltip.Root>
      <Tooltip.Trigger>
        <Button
          variant='unstyled'
          aria-label={t(localizationKeys('organizationProfile.securityPage.ssoSection.tooltipLabel'))}
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

/**
 * The display name of the role SSO-enrolled members are assigned — the environment's
 * default member role, name-mapped when the roles list is readable.
 */
const useEnrollmentRoleName = (): string | undefined => {
  const { organizationSettings } = useEnvironment();
  const { options } = useFetchRoles();
  const { localizeCustomRole } = useLocalizeCustomRoles();

  // Mirrors the invite form's default-role resolution.
  let roleKey = organizationSettings.domains.defaultRole ?? undefined;
  if (!roleKey && options?.length === 1) {
    roleKey = options[0].value;
  }

  if (!roleKey) {
    return undefined;
  }

  return (
    localizeCustomRole(roleKey) || options?.find(option => option.value === roleKey)?.label || humanizeRoleKey(roleKey)
  );
};

/** `org:billing_admin` → `billing admin`. */
const humanizeRoleKey = (roleKey: string): string => {
  const lastSegment = roleKey.split(':').pop() ?? roleKey;
  return lastSegment.replace(/[_-]+/g, ' ').trim() || roleKey;
};
