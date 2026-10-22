import { useSuspenseProfile, useSuspenseUser } from '@clerk/loom/react';

import { useUserProfileOptions } from '../../features/user-profile/user-profile.provider';
import {
  createProviderCatalog,
  projectConnectedAccounts,
  useUserProfileConnectedAccountsActions,
} from '../../features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section.model';
import { useUserProfileDeleteActions } from '../../features/user-profile/user-profile-danger-section/user-profile-danger-section.model';
import {
  projectPassword,
  useUserProfilePasswordActions,
} from '../../features/user-profile/user-profile-password-section/user-profile-password-section.model';
import { allowsIdentificationCreation } from '../../utils/allows-identification-creation';
import { useLoomProfileActionsContext } from './loom-profile-details.model';

export function useLoomConnectedAccounts() {
  const { user, settings } = useSuspenseProfile();
  const actions = useUserProfileConnectedAccountsActions(useLoomProfileActionsContext());
  const { additionalOAuthScopes } = useUserProfileOptions();
  const enabled = settings.providers.filter(provider => provider.enabled).map(provider => provider.strategy);
  const social = Object.fromEntries(
    settings.providers.map(provider => [
      provider.strategy,
      {
        strategy: provider.strategy,
        name: provider.name,
        logo_url: provider.logoUrl,
      },
    ]),
  );
  const providers = createProviderCatalog(enabled, social, user.externalAccounts);
  const display = projectConnectedAccounts({
    user: {
      verifiedExternalAccounts: user.externalAccounts.filter(account => account.verification?.status === 'verified'),
      unverifiedExternalAccounts: user.externalAccounts.filter(account => account.verification?.status !== 'verified'),
    },
    providers,
    socialEnabled: enabled.length > 0,
    allowCreation: allowsIdentificationCreation(user, { enabled: settings.enterpriseSsoEnabled }),
    additionalOAuthScopes,
  });
  return { display, actions, userId: user.id };
}

export function useLoomPassword() {
  const { user, settings } = useSuspenseProfile();
  const actions = useUserProfilePasswordActions(useLoomProfileActionsContext());
  return { display: projectPassword(user, settings.passwordEnabled), actions };
}

export function useLoomDanger() {
  const { data: user } = useSuspenseUser();
  const actions = useUserProfileDeleteActions(useLoomProfileActionsContext());
  return { visible: user.deleteSelfEnabled, actions };
}
