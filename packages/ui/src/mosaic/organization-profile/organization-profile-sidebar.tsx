import React from 'react';

import type { IconName } from '../icons/registry';
import type { ProfilePageSidebarProps } from '../profile-page';
import { ProfilePage } from '../profile-page';

export type OrganizationProfilePanelId = 'general' | 'members' | 'security' | 'billing' | 'api-keys';

const destinations: Record<OrganizationProfilePanelId, { label: string; icon: IconName }> = {
  general: { label: 'General', icon: 'building' },
  members: { label: 'Members', icon: 'users' },
  security: { label: 'Security', icon: 'shield-check' },
  billing: { label: 'Billing', icon: 'credit-card' },
  'api-keys': { label: 'API Keys', icon: 'code' },
};

export interface OrganizationProfileSidebarProps extends Omit<ProfilePageSidebarProps, 'items' | 'navigationLabel'> {
  panels: readonly OrganizationProfilePanelId[];
  renderBranding?: boolean;
}

export const OrganizationProfileSidebar = React.forwardRef<HTMLElement, OrganizationProfileSidebarProps>(
  function OrganizationProfileSidebar({ panels, ...rest }, ref) {
    return (
      <ProfilePage.Sidebar
        ref={ref}
        items={panels.map(value => ({ value, ...destinations[value] }))}
        navigationLabel='Organization profile'
        {...rest}
      />
    );
  },
);
