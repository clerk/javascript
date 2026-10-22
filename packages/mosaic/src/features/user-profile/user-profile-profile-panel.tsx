import type { ReactNode } from 'react';

import { UserProfileConnectedAccountsSection } from './user-profile-connected-accounts-section/user-profile-connected-accounts-section';
import { UserProfileDangerSection } from './user-profile-danger-section/user-profile-danger-section';
import { UserProfileEmailSection } from './user-profile-email-section/user-profile-email-section';
import { UserProfileEnterpriseAccountsSection } from './user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section';
import { UserProfilePhoneSection } from './user-profile-phone-section/user-profile-phone-section';
import { UserProfileProfilePanelView } from './user-profile-profile-panel.view';
import { UserProfileProfileSection } from './user-profile-profile-section/user-profile-profile-section';
import { UserProfileWeb3WalletsSection } from './user-profile-web3-wallets-section/user-profile-web3-wallets-section';

export interface UserProfileProfilePanelProps {
  children?: ReactNode;
  profileSection?: ReactNode;
  emailSection?: ReactNode;
  phoneSection?: ReactNode;
  connectedAccountsSection?: ReactNode;
  enterpriseAccountsSection?: ReactNode;
  web3WalletsSection?: ReactNode;
  dangerSection?: ReactNode;
}

export function UserProfileProfilePanel({
  children,
  profileSection,
  emailSection,
  phoneSection,
  connectedAccountsSection,
  enterpriseAccountsSection,
  web3WalletsSection,
  dangerSection,
}: UserProfileProfilePanelProps) {
  return (
    <UserProfileProfilePanelView>
      {children ?? (
        <>
          {profileSection ?? <UserProfileProfileSection />}
          {emailSection ?? <UserProfileEmailSection />}
          {phoneSection ?? <UserProfilePhoneSection />}
          {connectedAccountsSection ?? <UserProfileConnectedAccountsSection />}
          {enterpriseAccountsSection ?? <UserProfileEnterpriseAccountsSection />}
          {web3WalletsSection ?? <UserProfileWeb3WalletsSection />}
          {dangerSection ?? <UserProfileDangerSection />}
        </>
      )}
    </UserProfileProfilePanelView>
  );
}
