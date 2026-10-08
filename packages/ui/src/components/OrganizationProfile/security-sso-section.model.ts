import { useEnvironment } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import { useFetchRoles, useLocalizeCustomRoles } from '../../hooks/useFetchRoles';
import {
  isEnterpriseConnectionConfigured,
  organizationEnterpriseConnection,
} from '../ConfigureSSO/domain/organizationEnterpriseConnection';
import { providerLabel, toProviderCard } from '../ConfigureSSO/domain/providers';
import type { EnterpriseConnectionProviderType } from '../ConfigureSSO/types';
import { STATUS_BADGES } from './enterpriseConnectionStatusBadges';
import type { ConnectionRowProps } from './security-sso-section.types';

export const toSecuritySsoConnectionRow = (props: ConnectionRowProps) => {
  const { connection } = props;
  const { status } = organizationEnterpriseConnection({
    connection,
    hasSuccessfulTestRun: isEnterpriseConnectionConfigured(connection),
  });

  return {
    ...props,
    preview: {
      name: connection.name,
      domains: [...connection.domains],
      provider: connection.provider,
      logoPublicUrl: connection.logoPublicUrl,
    },
    status,
    badge: STATUS_BADGES[status],
    label: providerLabel(toProviderCard(props.connection.provider as EnterpriseConnectionProviderType)),
  };
};

/**
 * The display name of the role SSO-enrolled members are assigned — the environment's
 * default member role, name-mapped when the roles list is readable.
 */
export const useSsoInfoTooltipModel = () => {
  const { organizationSettings } = useEnvironment();
  const { options } = useFetchRoles();
  const { localizeCustomRole } = useLocalizeCustomRoles();
  const { t } = useLocalizations();

  // Mirrors the invite form's default-role resolution.
  let roleKey = organizationSettings.domains.defaultRole ?? undefined;
  if (!roleKey && options?.length === 1) {
    roleKey = options[0].value;
  }

  const roleName = roleKey
    ? localizeCustomRole(roleKey) ||
      options?.find(option => option.value === roleKey)?.label ||
      humanizeRoleKey(roleKey)
    : undefined;

  return {
    label: t(localizationKeys('organizationProfile.securityPage.ssoSection.tooltipLabel')),
    roleName,
  };
};

/** `org:billing_admin` → `billing admin`. */
const humanizeRoleKey = (roleKey: string): string => {
  const lastSegment = roleKey.split(':').pop() ?? roleKey;
  return lastSegment.replace(/[_-]+/g, ' ').trim() || roleKey;
};
