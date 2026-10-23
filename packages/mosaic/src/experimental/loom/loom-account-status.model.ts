import { useProfileSnapshot, useUserSnapshot } from '@clerk/loom/handoff';

import { useUserProfileOptions } from '../../features/user-profile/user-profile.provider';
import { createProviderCatalog, projectConnectedAccounts } from '../../features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section.model';
import { projectPassword } from '../../features/user-profile/user-profile-password-section/user-profile-password-section.model';
import { allowsIdentificationCreation } from '../../utils/allows-identification-creation';

export function useLoomConnectedAccounts() {
  const { additionalOAuthScopes } = useUserProfileOptions();
  const { user, settings } = useProfileSnapshot();
  const enabled = settings.providers.filter(provider => provider.enabled).map(provider => provider.strategy);
  const social = Object.fromEntries(
    settings.providers.map(provider => [
      provider.strategy,
      { strategy: provider.strategy, name: provider.name, logo_url: provider.logoUrl },
    ]),
  );
  const providers = createProviderCatalog(enabled, social, user.externalAccounts);
  return projectConnectedAccounts({
    user: {
      verifiedExternalAccounts: user.externalAccounts.filter(account => account.verification?.status === 'verified'),
      unverifiedExternalAccounts: user.externalAccounts.filter(account => account.verification?.status !== 'verified'),
    },
    providers,
    socialEnabled: enabled.length > 0,
    allowCreation: allowsIdentificationCreation(user, { enabled: settings.enterpriseSsoEnabled }),
    additionalOAuthScopes,
  });
}

export function useLoomPassword() {
  const { user, settings } = useProfileSnapshot();
  return projectPassword(user, settings.passwordEnabled);
}

export function useLoomDanger() {
  const { user } = useUserSnapshot();
  return user.deleteSelfEnabled;
}
