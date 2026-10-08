import { useClerk, useOAuthConsent, useUser } from '@clerk/shared/react';

import { useEnvironment, useOAuthConsentContext } from '@/ui/contexts';
import { localizationKeys, useLocalizations } from '@/ui/customizables';

import { getForwardedParams, getOAuthConsentFromSearch, getRedirectDisplay, getRedirectUriFromSearch } from './utils';

const OFFLINE_ACCESS_SCOPE = 'offline_access';
const PRIVATE_METADATA_SCOPE = 'private_metadata';
const USER_ORG_READ_SCOPE = 'user:org:read';

export const useOAuthConsentModel = () => {
  const ctx = useOAuthConsentContext();
  const clerk = useClerk();
  const { user } = useUser();
  const {
    displayConfig: { applicationName, logoImageUrl },
    organizationSettings,
  } = useEnvironment();
  const { t } = useLocalizations();
  const hasContextCallbacks = Boolean(ctx.onAllow || ctx.onDeny);
  const fromUrl = getOAuthConsentFromSearch();
  const oauthClientId = ctx.oauthClientId ?? fromUrl.oauthClientId;
  const scope = ctx.scope ?? fromUrl.scope;
  const redirectUri = ctx.redirectUrl ?? getRedirectUriFromSearch();
  const { data, isLoading, error } = useOAuthConsent({
    oauthClientId,
    scope,
    redirectUri: redirectUri || undefined,
    enabled: !hasContextCallbacks,
  });
  const mappedHookScopes = data?.scopes?.map(item => ({
    scope: item.scope,
    description: item.description,
    requires_consent: item.requiresConsent,
  }));
  const scopes = ctx.scopes ?? mappedHookScopes ?? [];
  const oauthApplicationName = ctx.oauthApplicationName ?? data?.oauthApplicationName ?? '';
  const oauthApplicationLogoUrl = ctx.oauthApplicationLogoUrl ?? data?.oauthApplicationLogoUrl;
  const oauthApplicationUrl = ctx.oauthApplicationUrl ?? data?.oauthApplicationUrl;
  const redirectUrl = ctx.redirectUrl ?? redirectUri;
  const orgSelectionEnabled = scopes.some(item => item.scope === USER_ORG_READ_SCOPE) && organizationSettings.enabled;
  const orgOptions = orgSelectionEnabled
    ? (user?.organizationMemberships ?? []).map(membership => ({
        value: membership.organization.id,
        label: membership.organization.name,
        logoUrl: membership.organization.imageUrl,
      }))
    : [];
  const lastActiveOrgId = clerk.session?.lastActiveOrganizationId;
  const errorMessage = !hasContextCallbacks
    ? !oauthClientId
      ? 'The client ID is missing.'
      : !redirectUrl
        ? 'The redirect URI is missing.'
        : error
          ? (error.message ?? 'Failed to load consent information.')
          : undefined
    : undefined;
  const status = errorMessage ? 'error' : !hasContextCallbacks && isLoading ? 'loading' : 'ready';
  const domainAction = data?.redirectDomain ?? getRedirectDisplay(redirectUrl);

  return {
    status,
    errorMessage,
    actionUrl: status === 'ready' ? clerk.oauthApplication.buildConsentActionUrl({ clientId: oauthClientId }) : '',
    hasContextCallbacks,
    forwardedParams: getForwardedParams(),
    oauthApplicationName,
    oauthApplicationLogoUrl,
    oauthApplicationUrl,
    applicationName,
    hasApplicationLogo: Boolean(logoImageUrl),
    redirectUrl,
    domainAction,
    viewFullUrlText: t(localizationKeys('oauthConsent.viewFullUrl')),
    warningText: t(
      localizationKeys('oauthConsent.warning', {
        applicationName: oauthApplicationName || applicationName,
        domainAction,
      }),
    ),
    redirectNoticeText: t(localizationKeys('oauthConsent.redirectNotice', { domainAction })),
    offlineAccessNotice: t(localizationKeys('oauthConsent.offlineAccessNotice')),
    primaryIdentifier: user?.primaryEmailAddress?.emailAddress || user?.primaryPhoneNumber?.phoneNumber || '',
    orgOptions,
    orgSelectionEnabled,
    defaultOrg: orgOptions.find(option => option.value === lastActiveOrgId)?.value ?? orgOptions[0]?.value ?? null,
    displayedScopes: scopes
      .filter(item => item.scope !== OFFLINE_ACCESS_SCOPE)
      .map(item => ({
        scope: item.scope,
        description:
          item.scope === PRIVATE_METADATA_SCOPE
            ? t(localizationKeys('oauthConsent.scopeList.privateMetadata', { applicationName }))
            : item.description,
      })),
    hasOfflineAccess: scopes.some(item => item.scope === OFFLINE_ACCESS_SCOPE),
    allow: () => ctx.onAllow?.(),
    deny: () => ctx.onDeny?.(),
  };
};
