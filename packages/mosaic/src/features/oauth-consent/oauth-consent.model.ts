import { getRedirectDisplay } from '@clerk/shared/internal/clerk-js/oauthConsent';
import { useClerk, useOAuthConsent, useSession } from '@clerk/shared/react';
import type { OAuthClientRegistration } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { toLocalizableError } from '../../utils/errors';
import type { OAuthConsentClientIdentity, OAuthConsentModel } from './oauth-consent.types';
import { OFFLINE_ACCESS_SCOPE, USER_ORG_READ_SCOPE } from './oauth-consent.utils';

const POSTED_BY_FORM = ['scope', 'organization_id', 'consented'];

export interface OAuthConsentModelOptions {
  /**
   * Override the OAuth client ID. Defaults to the `client_id` query parameter
   * from the current URL.
   */
  oauthClientId?: string;
  /**
   * Override the OAuth scope. Defaults to the `scope` query parameter from
   * the current URL.
   */
  scope?: string;
  /**
   * Full URL or path to navigate to after the user allows or denies access.
   * Defaults to the `redirect_uri` query parameter from the current URL.
   */
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
    keepPreviousData: false,
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
    return { status: 'fetching', renderBranding: environment.displayConfig.branded };
  }

  const { user } = session;
  const requested = data.scopes.map(({ scope: name, description }) => ({ scope: name, description }));
  const organizations =
    environment.organizationSettings.enabled && requested.some(item => item.scope === USER_ORG_READ_SCOPE)
      ? user.organizationMemberships.map(membership => ({
          value: membership.organization.id,
          label: membership.organization.name,
          imageUrl: membership.organization.imageUrl,
        }))
      : [];

  return {
    status: 'ready',
    applicationName: environment.displayConfig.applicationName,
    oauthApplicationName: data.oauthApplicationName,
    clientIdentity: toClientIdentity(data.clientRegistration, data.clientMetadataHost),
    identifier: user.primaryEmailAddress?.emailAddress || user.primaryPhoneNumber?.phoneNumber || '',
    redirectUrl,
    redirectDomain: data.redirectDomain ?? getRedirectDisplay(redirectUrl),
    actionUrl: clerk.oauthApplication.buildConsentActionUrl({ clientId: oauthClientId }),
    forwardedParams: [...search.entries()].filter(([name]) => !POSTED_BY_FORM.includes(name)),
    renderBranding: environment.displayConfig.branded,
    scopes: requested,
    hasOfflineAccess: requested.some(item => item.scope === OFFLINE_ACCESS_SCOPE),
    organizations,
    defaultOrganizationId:
      (organizations.find(organization => organization.value === session.lastActiveOrganizationId) ?? organizations[0])
        ?.value ?? null,
    maxOrganizations: toOrganizationLimit(data.maxOrganizations),
  };
}

function toOrganizationLimit(reported: number | undefined): number {
  return reported !== undefined && Number.isInteger(reported) && reported >= 1 ? reported : 1;
}

function toClientIdentity(
  registration: OAuthClientRegistration | undefined,
  metadataHost: string | null | undefined,
): OAuthConsentClientIdentity | null {
  if (registration === 'dynamic') {
    return { registration };
  }
  if (registration === 'metadata_document' && metadataHost) {
    return { registration, metadataHost };
  }
  return null;
}
