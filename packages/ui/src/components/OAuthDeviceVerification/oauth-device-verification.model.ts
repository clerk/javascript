import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useOAuthDeviceVerification, useUser } from '@clerk/shared/react';

import { useEnvironment } from '@/ui/contexts';
import { localizationKeys, useLocalizations } from '@/ui/customizables';

import { getOAuthDeviceUserCodeFromSearch } from './utils';

const USER_ORG_READ_SCOPE = 'user:org:read';
const OFFLINE_ACCESS_SCOPE = 'offline_access';
const PRIVATE_METADATA_SCOPE = 'private_metadata';

const getErrorCode = (error: unknown): string | undefined =>
  isClerkAPIResponseError(error) ? error.errors?.[0]?.code : undefined;

export const useOAuthDeviceVerificationModel = () => {
  const clerk = useClerk();
  const { user } = useUser();
  const {
    displayConfig: { applicationName, logoImageUrl },
    organizationSettings,
  } = useEnvironment();
  const { t } = useLocalizations();
  const verification = useOAuthDeviceVerification();
  const data = verification.data;
  const orgSelectionEnabled =
    (data?.scopes.some(scope => scope.scope === USER_ORG_READ_SCOPE) ?? false) && organizationSettings.enabled;
  const orgOptions = orgSelectionEnabled
    ? (user?.organizationMemberships ?? []).map(membership => ({
        value: membership.organization.id,
        label: membership.organization.name,
        logoUrl: membership.organization.imageUrl,
      }))
    : [];
  const lastActiveOrgId = clerk.session?.lastActiveOrganizationId;

  return {
    prefillCode: getOAuthDeviceUserCodeFromSearch(),
    invalidCodeMessage: t(localizationKeys('oauthDeviceVerification.error.invalidCode')),
    unknownCodeMessage: t(localizationKeys('oauthDeviceVerification.error.unknownCode')),
    data: data
      ? {
          oauthApplicationName: data.oauthApplicationName,
          oauthApplicationLogoUrl: data.oauthApplicationLogoUrl,
          displayedScopes: data.scopes
            .filter(scope => scope.scope !== OFFLINE_ACCESS_SCOPE)
            .map(scope => ({
              scope: scope.scope,
              description:
                scope.scope === PRIVATE_METADATA_SCOPE
                  ? t(localizationKeys('oauthConsent.scopeList.privateMetadata', { applicationName }))
                  : scope.description,
            })),
          hasOfflineAccess: data.scopes.some(scope => scope.scope === OFFLINE_ACCESS_SCOPE),
        }
      : null,
    primaryIdentifier: user?.primaryEmailAddress?.emailAddress || user?.primaryPhoneNumber?.phoneNumber || '',
    showClerkLogo: Boolean(logoImageUrl),
    orgOptions,
    orgSelectionEnabled,
    defaultOrg: orgOptions.find(option => option.value === lastActiveOrgId)?.value ?? orgOptions[0]?.value ?? null,
    isSubmitting: verification.isSubmitting,
    lookup: async (userCode: string) => {
      try {
        const info = await verification.lookup({ userCode });
        return { ok: true as const, status: info.status };
      } catch (error) {
        return { ok: false as const, code: getErrorCode(error) };
      }
    },
    approve: async (userCode: string, organizationId: string | null) => {
      try {
        await verification.approve({ userCode, organizationId: organizationId ?? undefined });
        return { ok: true as const };
      } catch (error) {
        return { ok: false as const, code: getErrorCode(error) };
      }
    },
    deny: async (userCode: string) => {
      try {
        await verification.deny({ userCode });
        return { ok: true as const };
      } catch (error) {
        return { ok: false as const, code: getErrorCode(error) };
      }
    },
    reset: () => verification.reset(),
  };
};
