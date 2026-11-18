import { iconImageUrl } from '@clerk/shared/constants';
import type { EnterpriseConnectionResource } from '@clerk/shared/types';

import type { SSOConnectionStatus, SSOProviderFamily, SSOProviderKey } from './sso-connections.types';

export const SSO_STATUS_COLORS = {
  inProgress: 'warning',
  inactive: 'neutral',
  active: 'positive',
} as const satisfies Record<SSOConnectionStatus, string>;

const PROVIDER_KEYS: Record<string, SSOProviderKey> = {
  saml_okta: 'okta',
  saml_microsoft: 'microsoft',
  saml_google: 'google',
  saml_custom: 'customSaml',
};

const PROVIDER_ICON_IDS: Record<SSOProviderKey, string> = {
  okta: 'okta',
  microsoft: 'microsoft',
  google: 'google',
  customSaml: 'saml',
  oidc: 'oidc',
};

export function isOidcProvider(provider: string): boolean {
  return provider.startsWith('oidc_') || provider.startsWith('oauth_custom_');
}

export function providerFamily(provider: string): SSOProviderFamily {
  return isOidcProvider(provider) ? 'oidc' : 'saml';
}

export function providerKey(provider: string): SSOProviderKey {
  return isOidcProvider(provider) ? 'oidc' : (PROVIDER_KEYS[provider] ?? 'customSaml');
}

export function providerIconUrl(connection: EnterpriseConnectionResource): string {
  return iconImageUrl(PROVIDER_ICON_IDS[providerKey(connection.provider)]);
}

export function isConnectionConfigured(connection: EnterpriseConnectionResource): boolean {
  if (isOidcProvider(connection.provider)) {
    const config = connection.oauthConfig;
    return Boolean(config?.clientId && (config.discoveryUrl || (config.authUrl && config.tokenUrl)));
  }
  return Boolean(connection.samlConnection?.idpSsoUrl && connection.samlConnection?.idpEntityId);
}

export function connectionStatus(
  connection: EnterpriseConnectionResource,
  hasSuccessfulTestRun = isConnectionConfigured(connection),
): SSOConnectionStatus {
  if (connection.active) {
    return 'active';
  }
  return isConnectionConfigured(connection) && hasSuccessfulTestRun ? 'inactive' : 'inProgress';
}

export function sortConnections(connections: readonly EnterpriseConnectionResource[]): EnterpriseConnectionResource[] {
  return [...connections].sort((a, b) => {
    const aTime = a.createdAt?.getTime();
    const bTime = b.createdAt?.getTime();
    if (aTime !== bTime) {
      if (aTime === undefined) {
        return 1;
      }
      if (bTime === undefined) {
        return -1;
      }
      return aTime - bTime;
    }
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}
