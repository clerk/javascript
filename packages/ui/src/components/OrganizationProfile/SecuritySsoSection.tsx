import type { EnterpriseConnectionResource, OAuthProvider } from '@clerk/shared/types';

import { ProfileSection } from '@/ui/elements/Section';
import { Tooltip } from '@/ui/elements/Tooltip';

import { ProviderIcon } from '../../common';
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
import { ChevronRight, InformationCircle } from '../../icons';
import type { ConnectionScope } from '../ConfigureSSO/domain/connectionScope';
import { providerLabel, toProviderCard } from '../ConfigureSSO/domain/providers';
import { useOrganizationEnterpriseConnectionStatus } from '../ConfigureSSO/hooks/useOrganizationEnterpriseConnectionStatus';
import type { EnterpriseConnectionProviderType } from '../ConfigureSSO/types';
import { STATUS_BADGES } from './enterpriseConnectionStatusBadges';

type SecuritySsoSectionProps = {
  enterpriseConnections: EnterpriseConnectionResource[];
  onConfigure: (scope: ConnectionScope, forceInitialStep?: boolean) => void;
  onOpenConnection: (id: string) => void;
};

export const SecuritySsoSection = ({
  enterpriseConnections,
  onConfigure,
  onOpenConnection,
}: SecuritySsoSectionProps): JSX.Element => {
  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.ssoSection.title')}
      id='sso'
      centered={false}
      badge={
        <Flex
          align='center'
          gap={2}
        >
          <SsoInfoTooltip />
          {enterpriseConnections.length === 0 ? (
            <Badge
              elementDescriptor={descriptors.organizationProfileSecuritySsoBadge}
              elementId={descriptors.organizationProfileSecuritySsoBadge.setId(STATUS_BADGES.unconfigured.id)}
              colorScheme={STATUS_BADGES.unconfigured.colorScheme}
              localizationKey={STATUS_BADGES.unconfigured.label}
            />
          ) : undefined}
        </Flex>
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
              <ConnectionRow
                key={connection.id}
                connection={connection}
                onOpenConnection={onOpenConnection}
              />
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

type ConnectionRowProps = {
  connection: EnterpriseConnectionResource;
  onOpenConnection: (id: string) => void;
};

const ConnectionRow = ({ connection, onOpenConnection }: ConnectionRowProps): JSX.Element => {
  const { status } = useOrganizationEnterpriseConnectionStatus(connection, { probe: false });

  const badge = STATUS_BADGES[status];
  const label = providerLabel(toProviderCard(connection.provider as EnterpriseConnectionProviderType));

  return (
    <Button
      elementDescriptor={descriptors.organizationProfileSecuritySsoConnectionRow}
      variant='unstyled'
      onClick={() => onOpenConnection(connection.id)}
      sx={{ display: 'block', width: '100%', height: 'auto', padding: 0, textAlign: 'start' }}
    >
      <ProfileSection.Item
        as='span'
        id='sso'
        hoverable
      >
        <Flex
          as='span'
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

          <Col
            as='span'
            sx={{ minWidth: 0 }}
          >
            <Text as='span'>{connection.name}</Text>
            {label && (
              <Text
                as='span'
                colorScheme='secondary'
                variant='caption'
                localizationKey={label}
              />
            )}
          </Col>

          {connection.domains.length > 0 && (
            <Flex
              as='span'
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
          as='span'
          align='center'
          sx={t => ({ gap: t.space.$2 })}
        >
          <Badge
            elementDescriptor={descriptors.organizationProfileSecuritySsoBadge}
            elementId={descriptors.organizationProfileSecuritySsoBadge.setId(badge.id)}
            colorScheme={badge.colorScheme}
            localizationKey={badge.label}
          />

          <Icon
            icon={ChevronRight}
            aria-hidden
            sx={t => ({ width: t.sizes.$4, height: t.sizes.$4, color: t.colors.$colorMutedForeground })}
          />
        </Flex>
      </ProfileSection.Item>
    </Button>
  );
};

const SsoDescription = (): JSX.Element => (
  <Text
    as='p'
    elementDescriptor={descriptors.organizationProfileSecuritySsoDescription}
    colorScheme='secondary'
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
