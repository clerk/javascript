import { getRedirectDisplay } from '@clerk/shared/internal/clerk-js/oauthConsent';
import { useClerk, useOAuthConsent, useSession } from '@clerk/shared/react';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { toLocalizableError } from '../../utils/errors';
import type { OAuthConsentKnownData, OAuthConsentModel } from './oauth-consent.types';

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
  const { user } = session;
  const memberships = user.organizationMemberships.map(membership => ({
    value: membership.organization.id,
    label: membership.organization.name,
  }));
  const organizationsFor = (scopes: string[]) =>
    environment.organizationSettings.enabled && scopes.includes(USER_ORG_READ_SCOPE) ? memberships : [];
  const defaultOrganizationIdIn = (organizations: typeof memberships) =>
    (organizations.find(organization => organization.value === session.lastActiveOrganizationId) ?? organizations[0])
      ?.value ?? null;
  const requestedOrganizations = organizationsFor(scope?.split(' ') ?? []);
  const known: OAuthConsentKnownData = {
    applicationName: environment.displayConfig.applicationName,
    identifier: user.primaryEmailAddress?.emailAddress || user.primaryPhoneNumber?.phoneNumber || '',
    redirectUrl,
    redirectDomain: getRedirectDisplay(redirectUrl),
    actionUrl: clerk.oauthApplication.buildConsentActionUrl({ clientId: oauthClientId }),
    forwardedParams: [...search.entries()],
    renderBranding: environment.displayConfig.branded,
    organizations: requestedOrganizations,
    defaultOrganizationId: defaultOrganizationIdIn(requestedOrganizations),
  };
  if (isLoading || !data) {
    return { status: 'loading', known };
  }

  const requested = data.scopes.map(({ scope: name, description }) => ({ scope: name, description }));
  const organizations = organizationsFor(requested.map(item => item.scope));

  return {
    status: 'ready',
    ...known,
    oauthApplicationName: data.oauthApplicationName,
    scopes: requested.filter(item => item.scope !== OFFLINE_ACCESS_SCOPE),
    hasOfflineAccess: requested.some(item => item.scope === OFFLINE_ACCESS_SCOPE),
    organizations,
    defaultOrganizationId: defaultOrganizationIdIn(organizations),
    redirectDomain: data.redirectDomain ?? known.redirectDomain,
  };
}
