import type { ProfileSearchSection } from '../../components/profile';
import { useMessages } from '../../localization';
import type { UserProfilePageId, UserProfilePages } from './user-profile.types';

function present(sections: readonly (ProfileSearchSection & { content: unknown })[]): ProfileSearchSection[] {
  return sections.filter(section => section.content != null).map(({ id, label }) => ({ id, label }));
}

export function useUserProfileSearchSections(
  pages: UserProfilePages,
): (page: UserProfilePageId) => ProfileSearchSection[] | undefined {
  const profile = useMessages('userProfileProfileSection');
  const contact = useMessages('userProfileContact');
  const connectedAccounts = useMessages('userProfileConnectedAccounts');
  const enterpriseAccounts = useMessages('userProfileEnterpriseAccountsSection');
  const web3Wallets = useMessages('userProfileWeb3Wallets');
  const danger = useMessages('userProfileDangerSection');
  const password = useMessages('userProfilePasswordSection');
  const passkeys = useMessages('userProfilePasskeys');
  const mfa = useMessages('userProfileMfa');
  const activeDevices = useMessages('userProfileActiveDevices');
  return page => {
    const { account, security } = pages;
    if (page === 'account') {
      return present([
        { id: 'profile', label: profile.title, content: account.profileSlot },
        { id: 'email', label: contact.email.label, content: account.emailSlot },
        { id: 'phone', label: contact.phone.label, content: account.phoneSlot },
        { id: 'connected-accounts', label: connectedAccounts.title, content: account.connectedAccountsSlot },
        { id: 'enterprise-accounts', label: enterpriseAccounts.title, content: account.enterpriseAccountsSlot },
        { id: 'web3-wallets', label: web3Wallets.title, content: account.web3WalletsSlot },
        { id: 'danger', label: danger.sectionTitle, content: account.dangerSlot },
      ]);
    }
    if (page === 'security' && security) {
      return present([
        { id: 'password', label: password.label, content: security.passwordSlot },
        { id: 'passkeys', label: passkeys.label, content: security.passkeysSlot },
        {
          id: 'mfa',
          label: mfa.label,
          content: security.mfaSlot !== undefined ? security.mfaSlot : security.mfaMethods,
        },
        { id: 'active-devices', label: activeDevices.title, content: security.activeDevicesSlot },
      ]);
    }
    return undefined;
  };
}
