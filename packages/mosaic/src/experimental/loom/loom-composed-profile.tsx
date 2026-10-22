import { useState } from 'react';

import { UserProfileProvider } from '../../features/user-profile/user-profile.provider';
import type { UserProfileViewProps } from '../../features/user-profile/user-profile.view';
import { UserProfileView } from '../../features/user-profile/user-profile.view';
import { UserProfileProfilePanel } from '../../features/user-profile/user-profile-profile-panel';
import { UserProfileSecurityPanel } from '../../features/user-profile/user-profile-security-panel';
import { LoomConnectedAccounts, LoomDanger, LoomPassword } from './loom-account-status';
import { LoomProfileDetails } from './loom-profile-details';
import { LoomProfileEmails } from './loom-profile-emails';
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
              connectedAccountsSection={
                <LoomSectionBoundary failure='Could not load connected accounts.'>
                  <LoomConnectedAccounts />
                </LoomSectionBoundary>
              }
              dangerSection={
                <LoomSectionBoundary failure='Could not load account settings.'>
                  <LoomDanger />
                </LoomSectionBoundary>
              }
            />
          ),
          security: <UserProfileSecurityPanel passwordSection={<LoomPassword />} />,
        }}
      />
    </UserProfileProvider>
  );
}
