import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { styles } from '../profile-page.styles';
import { mergeStyleProps, themeProps } from '../props';
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

export interface OrganizationPageViewProps {
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

function Panel({ panel, panels }: { panel: OrganizationProfilePanelId; panels: OrganizationPagePanels }): ReactElement {
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

export function OrganizationPageView({
  activePanel,
  panels,
  onPanelChange,
  renderBranding = true,
}: OrganizationPageViewProps): ReactElement {
  const availablePanels = getAvailablePanels(panels);
  const resolvedPanel = availablePanels.includes(activePanel) ? activePanel : 'general';

  return (
    <div {...mergeStyleProps(themeProps('organization-page'), stylex.props(styles.root))}>
      <OrganizationProfileSidebar
        activePanel={resolvedPanel}
        panels={availablePanels}
        renderBranding={renderBranding}
        onPanelChange={onPanelChange}
      />
      <main {...stylex.props(styles.main)}>
        <div {...stylex.props(styles.content)}>
          <Panel
            panel={resolvedPanel}
            panels={panels}
          />
        </div>
      </main>
    </div>
  );
}
