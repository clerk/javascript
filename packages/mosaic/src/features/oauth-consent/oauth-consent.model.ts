import { getRedirectDisplay } from '@clerk/shared/internal/clerk-js/oauthConsent';
import { useClerk, useOAuthConsent, useSession } from '@clerk/shared/react';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { toLocalizableError } from '../../utils/errors';
import type { OAuthConsentModel } from './oauth-consent.types';

const OFFLINE_ACCESS_SCOPE = 'offline_access';
const USER_ORG_READ_SCOPE = 'user:org:read';

export interface OAuthConsentModelOptions {
  oauthClientId?: string;
  scope?: string;
  redirectUrl?: string;
}

function readSearchParams(): URLSearchParams {
  return typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
}

export function useOAuthConsentModel(options: OAuthConsentModelOptions): OAuthConsentModel {
  const clerk = useClerk();
  const { isLoaded, session } = useSession();
  const environment = useMosaicEnvironment();
  const search = readSearchParams();
  const oauthClientId = options.oauthClientId ?? search.get('client_id') ?? '';
  const scope = options.scope ?? search.get('scope') ?? undefined;
  const redirectUrl = options.redirectUrl ?? search.get('redirect_uri') ?? '';
  const { data, error, isLoading } = useOAuthConsent({
    oauthClientId,
    scope,
    redirectUri: redirectUrl || undefined,
    enabled: redirectUrl !== '',
  });

  if (!isLoaded || !environment) {
    return { status: 'loading' };
  }
  if (!session) {
    return { status: 'hidden' };
  }
  if (!oauthClientId) {
    return { status: 'error', error: { code: 'oauth_consent_missing_client_id' } };
  }
  if (!redirectUrl) {
    return { status: 'error', error: { code: 'oauth_consent_missing_redirect_uri' } };
  }
  if (error) {
    return { status: 'error', error: toLocalizableError(error) };
  }
  if (isLoading || !data) {
    return { status: 'loading' };
  }

  const { user } = session;
  const requested = data.scopes.map(({ scope: name, description }) => ({ scope: name, description }));
  const readsOrganizations =
    environment.organizationSettings.enabled && requested.some(item => item.scope === USER_ORG_READ_SCOPE);
  const organizations = readsOrganizations
    ? user.organizationMemberships.map(membership => ({
        value: membership.organization.id,
        label: membership.organization.name,
      }))
    : [];
  const lastActive = organizations.find(organization => organization.value === session.lastActiveOrganizationId);

  return {
    status: 'ready',
    applicationName: environment.displayConfig.applicationName,
    oauthApplicationName: data.oauthApplicationName,
    identifier: user.primaryEmailAddress?.emailAddress || user.primaryPhoneNumber?.phoneNumber || '',
    scopes: requested.filter(item => item.scope !== OFFLINE_ACCESS_SCOPE),
    hasOfflineAccess: requested.some(item => item.scope === OFFLINE_ACCESS_SCOPE),
    organizations,
    defaultOrganizationId: (lastActive ?? organizations[0])?.value ?? null,
    redirectUrl,
    redirectDomain: data.redirectDomain ?? getRedirectDisplay(redirectUrl),
    actionUrl: clerk.oauthApplication.buildConsentActionUrl({ clientId: oauthClientId }),
    forwardedParams: [...search.entries()],
    renderBranding: environment.displayConfig.branded,
  };
}
