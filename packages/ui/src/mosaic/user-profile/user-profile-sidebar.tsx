import React from 'react';

import type { IconName } from '../icons/registry';
import type { ProfilePageSidebarProps } from '../profile-page';
import { ProfilePage } from '../profile-page';

export type UserProfilePanelId = 'account' | 'security' | 'billing' | 'api-keys';

const destinations: Record<UserProfilePanelId, { label: string; icon: IconName }> = {
  account: { label: 'Account', icon: 'user-circle' },
  security: { label: 'Security', icon: 'shield-check' },
  billing: { label: 'Billing', icon: 'credit-card' },
  'api-keys': { label: 'API Keys', icon: 'code' },
};

export interface UserProfileSidebarProps extends Omit<ProfilePageSidebarProps, 'items' | 'navigationLabel'> {
  panels: readonly UserProfilePanelId[];
  renderBranding?: boolean;
}

export const UserProfileSidebar = React.forwardRef<HTMLElement, UserProfileSidebarProps>(function UserProfileSidebar(
  { panels, ...rest },
  ref,
) {
  return (
    <ProfilePage.Sidebar
      ref={ref}
      items={panels.map(value => ({ value, ...destinations[value] }))}
      navigationLabel='User profile'
      {...rest}
    />
  );
});
