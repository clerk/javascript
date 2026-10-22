import type { ReactNode } from 'react';

import { UserProfileActiveDevicesSection } from './user-profile-active-devices-section/user-profile-active-devices-section';
import { UserProfileMfaSection } from './user-profile-mfa-section/user-profile-mfa-section';
import { UserProfilePasskeysSection } from './user-profile-passkeys-section/user-profile-passkeys-section';
import { UserProfilePasswordSection } from './user-profile-password-section/user-profile-password-section';
import { UserProfileSecurityPanelView } from './user-profile-security-panel.view';

export interface UserProfileSecurityPanelProps {
  children?: ReactNode;
  passwordSection?: ReactNode;
}

export function UserProfileSecurityPanel({ children, passwordSection }: UserProfileSecurityPanelProps) {
  return (
    <UserProfileSecurityPanelView>
      {children ?? (
        <>
          {passwordSection ?? <UserProfilePasswordSection />}
          <UserProfilePasskeysSection />
          <UserProfileMfaSection />
          <UserProfileActiveDevicesSection />
        </>
      )}
    </UserProfileSecurityPanelView>
  );
}
