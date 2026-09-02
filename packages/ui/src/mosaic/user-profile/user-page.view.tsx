import React from 'react';

import type { ProfilePageRootProps } from '../profile-page';
import { ProfilePage } from '../profile-page';
import type { UserProfileApiKeysPanelViewProps } from './user-profile-api-keys-panel.view';
import { UserProfileApiKeysPanelView } from './user-profile-api-keys-panel.view';
import type { UserProfileBillingPanelViewProps } from './user-profile-billing-panel.view';
import { UserProfileBillingPanelView } from './user-profile-billing-panel.view';
import type { UserProfileProfilePanelViewProps } from './user-profile-profile-panel.view';
import { UserProfileProfilePanelView } from './user-profile-profile-panel.view';
import type { UserProfileSecurityPanelViewProps } from './user-profile-security-panel.view';
import { UserProfileSecurityPanelView } from './user-profile-security-panel.view';
import type { UserProfilePanelId } from './user-profile-sidebar';
import { UserProfileSidebar } from './user-profile-sidebar';

export interface UserPagePanels {
  account: UserProfileProfilePanelViewProps;
  security?: UserProfileSecurityPanelViewProps;
  billing?: UserProfileBillingPanelViewProps;
  apiKeys?: UserProfileApiKeysPanelViewProps;
}

export interface UserPageViewProps extends Omit<ProfilePageRootProps, 'children' | 'value' | 'onValueChange'> {
  activePanel: UserProfilePanelId;
  panels: UserPagePanels;
  onPanelChange: (panel: UserProfilePanelId) => void;
  renderBranding?: boolean;
  /**
   * Rendered after the panels. When the page is the popup of a dialog, this is where the dialog's
   * parts land — its `CloseButton`, and any prompt it opens.
   */
  children?: React.ReactNode;
}

function getAvailablePanels(panels: UserPagePanels): UserProfilePanelId[] {
  return [
    'account',
    ...(panels.security ? (['security'] as const) : []),
    ...(panels.billing ? (['billing'] as const) : []),
    ...(panels.apiKeys ? (['api-keys'] as const) : []),
  ];
}

function Panel({ panel, panels }: { panel: UserProfilePanelId; panels: UserPagePanels }): React.ReactElement {
  switch (panel) {
    case 'security':
      return panels.security ? (
        <UserProfileSecurityPanelView {...panels.security} />
      ) : (
        <UserProfileProfilePanelView {...panels.account} />
      );
    case 'billing':
      return panels.billing ? (
        <UserProfileBillingPanelView {...panels.billing} />
      ) : (
        <UserProfileProfilePanelView {...panels.account} />
      );
    case 'api-keys':
      return panels.apiKeys ? (
        <UserProfileApiKeysPanelView {...panels.apiKeys} />
      ) : (
        <UserProfileProfilePanelView {...panels.account} />
      );
    case 'account':
      return <UserProfileProfilePanelView {...panels.account} />;
  }
}

export const UserPageView = React.forwardRef<HTMLDivElement, UserPageViewProps>(function UserPageView(
  { activePanel, panels, onPanelChange, renderBranding = true, children, render, className, style, ...rest },
  ref,
) {
  const availablePanels = getAvailablePanels(panels);
  const resolvedPanel = availablePanels.includes(activePanel) ? activePanel : 'account';
  const handlePanelChange = (value: string) => {
    const panel = availablePanels.find(candidate => candidate === value);
    if (panel) {
      onPanelChange(panel);
    }
  };

  return (
    <ProfilePage.Root
      ref={ref}
      value={resolvedPanel}
      onValueChange={handlePanelChange}
      render={render}
      className={className}
      style={style}
      {...rest}
    >
      <UserProfileSidebar
        panels={availablePanels}
        renderBranding={renderBranding}
      />
      <ProfilePage.Content>
        {availablePanels.map(panel => (
          <ProfilePage.Panel
            key={panel}
            value={panel}
          >
            <Panel
              panel={panel}
              panels={panels}
            />
          </ProfilePage.Panel>
        ))}
      </ProfilePage.Content>
      {children}
    </ProfilePage.Root>
  );
});
