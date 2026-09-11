import type { EnterpriseConnectionResource, OAuthProvider } from '@clerk/shared/types';
import { useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { Tooltip } from '@/ui/elements/Tooltip';
import { handleError } from '@/utils/errorHandler';

import { ProviderIcon } from '../../common';
import { useEnvironment } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
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
import type { OrganizationEnterpriseConnectionStatus } from '../ConfigureSSO/domain/organizationEnterpriseConnection';
import { providerLabel, toProviderCard } from '../ConfigureSSO/domain/providers';
import type { EnterpriseConnectionMutations } from '../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import { useOrganizationEnterpriseConnectionStatus } from '../ConfigureSSO/hooks/useOrganizationEnterpriseConnectionStatus';
import { ResetConnectionDialog } from '../ConfigureSSO/ResetConnectionDialog';
import type { EnterpriseConnectionProviderType } from '../ConfigureSSO/types';

type SecuritySsoSectionProps = {
  enterpriseConnections: EnterpriseConnectionResource[];
  setConnectionActive: EnterpriseConnectionMutations['setConnectionActive'];
  deleteConnection: EnterpriseConnectionMutations['deleteConnection'];
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onConfigure: (scope: ConnectionScope, forceInitialStep?: boolean) => void;
};

const STATUS_BADGES: Record<
  OrganizationEnterpriseConnectionStatus,
  { id: string; colorScheme?: 'primary' | 'danger' | 'warning' | 'success'; label: LocalizationKey }
> = {
  unconfigured: {
    id: 'unconfigured',
    colorScheme: 'primary',
    label: localizationKeys('organizationProfile.securityPage.ssoSection.badge__unconfigured'),
  },
  in_progress: {
    id: 'inProgress',
    colorScheme: 'warning',
    label: localizationKeys('organizationProfile.securityPage.ssoSection.badge__inProgress'),
  },
  active: {
    id: 'active',
    colorScheme: 'success',
    label: localizationKeys('organizationProfile.securityPage.ssoSection.badge__active'),
  },
  inactive: {
    id: 'inactive',
    colorScheme: 'danger',
    label: localizationKeys('organizationProfile.securityPage.ssoSection.badge__inactive'),
  },
};

export const SecuritySsoSection = (props: SecuritySsoSectionProps): JSX.Element => {
  const { enterpriseConnections, onConfigure } = props;

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.ssoSection.title')}
      id='sso'
      centered={false}
      badge={
        enterpriseConnections.length === 0 ? (
          <Badge
            elementDescriptor={descriptors.organizationProfileSecuritySsoBadge}
            elementId={descriptors.organizationProfileSecuritySsoBadge.setId(STATUS_BADGES.unconfigured.id)}
            colorScheme={STATUS_BADGES.unconfigured.colorScheme}
            localizationKey={STATUS_BADGES.unconfigured.label}
          />
        ) : undefined
      }
    >
      {enterpriseConnections.length === 0 ? (
        <Col
          align='start'
          gap={4}
        >
          <SsoDescription />

          <Button
            elementDescriptor={descriptors.organizationProfileSecuritySsoConfigureButton}
            elementId={descriptors.organizationProfileSecuritySsoConfigureButton.setId('start')}
            variant='bordered'
            colorScheme='secondary'
            size='sm'
            onClick={() => onConfigure({ kind: 'new' }, true)}
            localizationKey={localizationKeys(
              'organizationProfile.securityPage.ssoSection.primaryButton__startConfiguration',
            )}
          />
        </Col>
      ) : (
        <Col gap={4}>
          <SsoDescription />

          <ProfileSection.ItemList id='sso'>
            {enterpriseConnections.map(connection => (
              <CardStateProvider key={connection.id}>
                <ConnectionRow
                  {...props}
                  connection={connection}
                />
              </CardStateProvider>
            ))}
          </ProfileSection.ItemList>

          <ProfileSection.ArrowButton
            id='sso'
            localizationKey={localizationKeys(
              'organizationProfile.securityPage.ssoSection.primaryButton__addConnection',
            )}
            onClick={() => onConfigure({ kind: 'new' }, true)}
          />
        </Col>
      )}
    </ProfileSection.Root>
  );
};

type ConnectionRowProps = SecuritySsoSectionProps & {
  connection: EnterpriseConnectionResource;
};

const ConnectionRow = ({
  connection,
  setConnectionActive,
  deleteConnection,
  organizationName,
  contentRef,
  onConfigure,
}: ConnectionRowProps): JSX.Element => {
  const card = useCardState();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const { status } = useOrganizationEnterpriseConnectionStatus(connection);

  const badge = STATUS_BADGES[status];
  const label = providerLabel(toProviderCard(connection.provider as EnterpriseConnectionProviderType));

  const onSetActive = async (active: boolean) => {
    if (card.isLoading) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      // The mutation revalidates before resolving, so the refreshed entity drives the settled UI.
      await setConnectionActive(connection.id, active);
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  const actions = [
    {
      label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__edit'),
      onClick: () => onConfigure({ kind: 'existing', id: connection.id }, true),
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
  ];

  return (
    <Col gap={2}>
      <ProfileSection.Item id='sso'>
        <Flex
          align='center'
          wrap='wrap'
          sx={t => ({ minWidth: 0, flex: 1, gap: t.space.$2 })}
        >
          <ProviderIcon
            id={connection.provider.replace(/(oauth_|saml_)/, '').trim() as OAuthProvider}
            iconUrl={connection.logoPublicUrl?.trim() || undefined}
            name={connection.name}
            elementDescriptor={descriptors.organizationProfileSecuritySsoProviderIcon}
          />

          <Col sx={{ minWidth: 0 }}>
            <Text>{connection.name}</Text>
            {label && (
              <Text
                colorScheme='secondary'
                variant='caption'
                localizationKey={label}
              />
            )}
          </Col>

          {connection.domains.length > 0 && (
            <Flex
              align='center'
              wrap='wrap'
              sx={t => ({ minWidth: 0, gap: t.space.$1x5 })}
            >
              {connection.domains.map(domain => (
                <Badge
                  key={domain}
                  elementDescriptor={descriptors.organizationProfileSecuritySsoDetailRowChip}
                >
                  {domain}
                </Badge>
              ))}
            </Flex>
          )}
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

          <ThreeDotsMenu
            elementId='sso'
            actions={actions}
          />
        </Flex>
      </ProfileSection.Item>

      <Card.Alert>{card.error}</Card.Alert>

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
    </Col>
  );
};

const SsoDescription = (): JSX.Element => {
  const roleName = useEnrollmentRoleName();
  const { t } = useLocalizations();

  return (
    <Text as='p'>
      <Text
        as='span'
        elementDescriptor={descriptors.organizationProfileSecuritySsoDescription}
        colorScheme='secondary'
        localizationKey={localizationKeys('organizationProfile.securityPage.ssoSection.descriptionLine1')}
      />

      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button
            variant='unstyled'
            aria-label={t(localizationKeys('organizationProfile.securityPage.ssoSection.tooltipLabel'))}
            sx={t => ({
              display: 'inline-flex',
              alignItems: 'center',
              verticalAlign: 'middle',
              padding: 0,
              height: 'fit-content',
              borderRadius: t.radii.$sm,
              color: t.colors.$colorMutedForeground,
              marginInlineStart: t.space.$1,
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
    </Text>
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
