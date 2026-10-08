import { useClerk } from '@clerk/shared/react';
import type { EnableEnvironmentSettingParams } from '@clerk/shared/types';

import { useEnvironment, useOptions } from '@/ui/contexts';

export const useEnableOrganizationsPromptModel = () => {
  const clerk = useClerk();
  const environment = useEnvironment();
  const options = useOptions();
  const claimUrl = options.__internal_keyless_claimKeylessApplicationUrl;
  const copyKeysUrl = options.__internal_keyless_copyInstanceKeysUrl;
  const hasPersonalAccountsEnabled =
    typeof environment?.organizationSettings.forceOrganizationSelection !== 'undefined';

  return {
    claimUrl,
    isKeyless: Boolean(claimUrl) && Boolean(copyKeysUrl),
    isClaimed: environment.authConfig.claimedAt !== null,
    hasUser: Boolean(clerk.user),
    hasPersonalAccountsEnabled,
    enableOrganizations: async (allowPersonalAccount: boolean) => {
      const params: EnableEnvironmentSettingParams = { enable_organizations: true };
      if (hasPersonalAccountsEnabled) {
        params.organization_allow_personal_accounts = allowPersonalAccount;
      }
      await environment.__internal_enableEnvironmentSetting(params);
      const memberships = await clerk.user?.getOrganizationMemberships();
      return memberships?.data[0]?.organization.name ?? null;
    },
    closePrompt: () => clerk.__internal_closeEnableOrganizationsPrompt?.(),
    redirectToSignIn: () => clerk.redirectToSignIn(),
  };
};
