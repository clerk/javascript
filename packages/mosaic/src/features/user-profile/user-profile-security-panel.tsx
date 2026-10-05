import type { ReactNode } from 'react';

import { passwordSectionNode } from './user-profile-password-section/user-profile-password-section';
import { useUserProfilePasswordModel } from './user-profile-password-section/user-profile-password-section.model';
import type { UserProfileSecurityPanelViewProps } from './user-profile-security-panel.view';
import { UserProfileSecurityPanelView } from './user-profile-security-panel.view';

export interface UserProfileSecurityPanelProps extends Omit<UserProfileSecurityPanelViewProps, 'passwordSlot'> {
  passwordFallback?: ReactNode;
}

export function UserProfileSecurityPanel({ passwordFallback = null, ...props }: UserProfileSecurityPanelProps) {
  const password = useUserProfilePasswordModel();
  const passwordSlot = passwordSectionNode(password, passwordFallback);

  return (
    <UserProfileSecurityPanelView
      {...props}
      passwordSlot={passwordSlot}
    />
  );
}
