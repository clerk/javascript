import { useState } from 'react';

import { UserProfileProvider } from '../../features/user-profile/user-profile.provider';
import type { UserProfileViewProps } from '../../features/user-profile/user-profile.view';
import { UserProfileView } from '../../features/user-profile/user-profile.view';
import { UserProfileProfilePanel } from '../../features/user-profile/user-profile-profile-panel';
import { UserProfileSecurityPanel } from '../../features/user-profile/user-profile-security-panel';
import { LoomConnectedAccounts, LoomDanger, LoomPassword } from './loom-account-status';
import { LoomActiveDevices } from './loom-active-devices';
import { LoomProfileDetails } from './loom-profile-details';
import { LoomProfileEmails } from './loom-profile-emails';
import { LoomProfileEnterprise } from './loom-profile-enterprise';
import { LoomProfileMfa } from './loom-profile-mfa';
import { LoomProfilePasskeys } from './loom-profile-passkeys';
import { LoomProfilePhones } from './loom-profile-phones';
import { LoomProfileWallets } from './loom-profile-wallets';
import { LoomSectionBoundary } from './loom-section-boundary';

export function LoomComposedProfile() {
  const [activePage, setActivePage] = useState<UserProfileViewProps['activePage']>('account');
  return (
    <UserProfileProvider mode='mounted'>
      <UserProfileView
        elevation='flush'
        activePage={activePage}
        onPageChange={setActivePage}
        pages={{
          account: (
            <UserProfileProfilePanel
              profileSection={
                <LoomSectionBoundary failure='Could not load profile details.'>
                  <LoomProfileDetails />
                </LoomSectionBoundary>
              }
              emailSection={
                <LoomSectionBoundary failure='Could not load email addresses.'>
                  <LoomProfileEmails />
                </LoomSectionBoundary>
              }
              phoneSection={
                <LoomSectionBoundary failure='Could not load phone numbers.'>
                  <LoomProfilePhones />
                </LoomSectionBoundary>
              }
              connectedAccountsSection={
                <LoomSectionBoundary failure='Could not load connected accounts.'>
                  <LoomConnectedAccounts />
                </LoomSectionBoundary>
              }
              enterpriseAccountsSection={
                <LoomSectionBoundary failure='Could not load enterprise accounts.'>
                  <LoomProfileEnterprise />
                </LoomSectionBoundary>
              }
              web3WalletsSection={
                <LoomSectionBoundary failure='Could not load web3 wallets.'>
                  <LoomProfileWallets />
                </LoomSectionBoundary>
              }
              dangerSection={
                <LoomSectionBoundary failure='Could not load account settings.'>
                  <LoomDanger />
                </LoomSectionBoundary>
              }
            />
          ),
          security: (
            <UserProfileSecurityPanel
              passwordSection={
                <LoomSectionBoundary failure='Could not load password settings.'>
                  <LoomPassword />
                </LoomSectionBoundary>
              }
              passkeysSection={
                <LoomSectionBoundary failure='Could not load passkeys.'>
                  <LoomProfilePasskeys />
                </LoomSectionBoundary>
              }
              mfaSection={
                <LoomSectionBoundary failure='Could not load verification methods.'>
                  <LoomProfileMfa />
                </LoomSectionBoundary>
              }
              activeDevicesSection={
                <LoomSectionBoundary failure='Could not load devices.'>
                  <LoomActiveDevices showRefresh={false} />
                </LoomSectionBoundary>
              }
            />
          ),
        }}
      />
    </UserProfileProvider>
  );
}
