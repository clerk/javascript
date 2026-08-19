import React from 'react';

import type { ProfilePageRootProps } from '../profile-page';
import { ProfilePage } from '../profile-page';
import type { OrganizationProfileApiKeysPanelViewProps } from './organization-profile-api-keys-panel.view';
import { OrganizationProfileApiKeysPanelView } from './organization-profile-api-keys-panel.view';
import type { OrganizationProfileBillingPanelViewProps } from './organization-profile-billing-panel.view';
import { OrganizationProfileBillingPanelView } from './organization-profile-billing-panel.view';
import type { OrganizationProfileGeneralPanelViewProps } from './organization-profile-general-panel.view';
import { OrganizationProfileGeneralPanelView } from './organization-profile-general-panel.view';
import type { OrganizationProfileMembersPanelViewProps } from './organization-profile-members-panel.view';
import { OrganizationProfileMembersPanelView } from './organization-profile-members-panel.view';
import type { OrganizationProfileSecurityPanelViewProps } from './organization-profile-security-panel.view';
import { OrganizationProfileSecurityPanelView } from './organization-profile-security-panel.view';
import type { OrganizationProfilePanelId } from './organization-profile-sidebar';
import { OrganizationProfileSidebar } from './organization-profile-sidebar';

export interface OrganizationPagePanels {
  general: OrganizationProfileGeneralPanelViewProps;
  members?: OrganizationProfileMembersPanelViewProps;
  security?: OrganizationProfileSecurityPanelViewProps;
  billing?: OrganizationProfileBillingPanelViewProps;
  apiKeys?: OrganizationProfileApiKeysPanelViewProps;
}

export interface OrganizationPageViewProps extends Omit<ProfilePageRootProps, 'children' | 'value' | 'onValueChange'> {
  activePanel: OrganizationProfilePanelId;
  panels: OrganizationPagePanels;
  onPanelChange: (panel: OrganizationProfilePanelId) => void;
  renderBranding?: boolean;
}

function getAvailablePanels(panels: OrganizationPagePanels): OrganizationProfilePanelId[] {
  return [
    'general',
    ...(panels.members ? (['members'] as const) : []),
    ...(panels.security ? (['security'] as const) : []),
    ...(panels.billing ? (['billing'] as const) : []),
    ...(panels.apiKeys ? (['api-keys'] as const) : []),
  ];
}

function Panel({
  panel,
  panels,
}: {
  panel: OrganizationProfilePanelId;
  panels: OrganizationPagePanels;
}): React.ReactElement {
  switch (panel) {
    case 'members':
      return panels.members ? (
        <OrganizationProfileMembersPanelView {...panels.members} />
      ) : (
        <OrganizationProfileGeneralPanelView {...panels.general} />
      );
    case 'security':
      return panels.security ? (
        <OrganizationProfileSecurityPanelView {...panels.security} />
      ) : (
        <OrganizationProfileGeneralPanelView {...panels.general} />
      );
    case 'billing':
      return panels.billing ? (
        <OrganizationProfileBillingPanelView {...panels.billing} />
      ) : (
        <OrganizationProfileGeneralPanelView {...panels.general} />
      );
    case 'api-keys':
      return panels.apiKeys ? (
        <OrganizationProfileApiKeysPanelView {...panels.apiKeys} />
      ) : (
        <OrganizationProfileGeneralPanelView {...panels.general} />
      );
    case 'general':
      return <OrganizationProfileGeneralPanelView {...panels.general} />;
  }
}

export const OrganizationPageView = React.forwardRef<HTMLDivElement, OrganizationPageViewProps>(
  function OrganizationPageView(
    { activePanel, panels, onPanelChange, renderBranding = true, render, className, style, ...rest },
    ref,
  ) {
    const availablePanels = getAvailablePanels(panels);
    const resolvedPanel = availablePanels.includes(activePanel) ? activePanel : 'general';
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
        <OrganizationProfileSidebar
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
      </ProfilePage.Root>
    );
  },
);
