import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { EnvironmentResource, UserResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { allowsIdentificationCreation } from '../../utils/allows-identification-creation';
import type { UserProfilePageId } from './user-profile.types';
import { toContactAccess } from './user-profile-contact.utils';
import { projectEnterpriseAccounts } from './user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.model';
import { offersMfa } from './user-profile-mfa-section/user-profile-mfa-section.model';
import { getPasskeysProjection } from './user-profile-passkeys-section/user-profile-passkeys-section.model';
import { getPasswordPolicy } from './user-profile-password-section/user-profile-password-section.model';
import { projectWeb3Wallets } from './user-profile-web3-wallets-section/user-profile-web3-wallets-section.model';

export type UserProfileSectionId =
  | 'profile'
  | 'email'
  | 'phone'
  | 'connectedAccounts'
  | 'enterpriseAccounts'
  | 'web3Wallets'
  | 'danger'
  | 'password'
  | 'passkeys'
  | 'mfa'
  | 'activeDevices';

export type UserProfileSearchSections = Partial<Record<UserProfilePageId, readonly UserProfileSectionId[]>>;

export function useUserProfileSearchModel(): UserProfileSearchSections {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const environment = useMosaicEnvironment();

  if (!user || !environment) {
    return {};
  }
  return {
    account: accountSections(user, environment),
    security: session ? securitySections(user, environment, clerk.isSatellite) : [],
  };
}

function accountSections(user: UserResource, environment: EnvironmentResource): UserProfileSectionId[] {
  const { attributes, enterpriseSSO, socialProviderStrategies, web3FirstFactors } = environment.userSettings;
  const canAdd = allowsIdentificationCreation(user, enterpriseSSO);
  const web3Wallet = attributes.web3_wallet;
  return shown([
    ['profile', true],
    ['email', toContactAccess(attributes.email_address, user.emailAddresses.length, canAdd).show],
    ['phone', toContactAccess(attributes.phone_number, user.phoneNumbers.length, canAdd).show],
    ['connectedAccounts', socialProviderStrategies.length > 0],
    [
      'enterpriseAccounts',
      projectEnterpriseAccounts({ enabled: enterpriseSSO.enabled, accounts: user.enterpriseAccounts, connections: [] })
        .status !== 'hidden',
    ],
    [
      'web3Wallets',
      Boolean(web3Wallet?.enabled) &&
        projectWeb3Wallets({
          wallets: user.web3Wallets,
          primaryId: user.primaryWeb3WalletId,
          enabledStrategies: web3FirstFactors,
          allowCreation: !web3Wallet?.immutable && canAdd,
        }).status !== 'hidden',
    ],
    ['danger', user.deleteSelfEnabled],
  ]);
}

function securitySections(
  user: UserResource,
  environment: EnvironmentResource,
  isSatellite: boolean,
): UserProfileSectionId[] {
  return shown([
    ['password', getPasswordPolicy(user, environment).status !== 'hidden'],
    ['passkeys', getPasskeysProjection(user, environment, isSatellite).status !== 'hidden'],
    ['mfa', offersMfa(environment)],
    ['activeDevices', true],
  ]);
}

function shown(sections: readonly (readonly [UserProfileSectionId, boolean])[]): UserProfileSectionId[] {
  return sections.flatMap(([id, visible]) => (visible ? [id] : []));
}
