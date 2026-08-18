import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { mergeStyleProps, themeProps } from '../props';
import { styles } from './user-profile.styles';
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

export interface UserPageViewProps {
  activePanel: UserProfilePanelId;
  panels: UserPagePanels;
  onPanelChange: (panel: UserProfilePanelId) => void;
  renderBranding?: boolean;
}

function getAvailablePanels(panels: UserPagePanels): UserProfilePanelId[] {
  return [
    'account',
    ...(panels.security ? (['security'] as const) : []),
    ...(panels.billing ? (['billing'] as const) : []),
    ...(panels.apiKeys ? (['api-keys'] as const) : []),
  ];
}

function Panel({ panel, panels }: { panel: UserProfilePanelId; panels: UserPagePanels }): ReactElement {
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

export function UserPageView({
  activePanel,
  panels,
  onPanelChange,
  renderBranding = true,
}: UserPageViewProps): ReactElement {
  const availablePanels = getAvailablePanels(panels);
  const resolvedPanel = availablePanels.includes(activePanel) ? activePanel : 'account';

  return (
    <div {...mergeStyleProps(themeProps('user-page'), stylex.props(styles.root))}>
      <UserProfileSidebar
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
