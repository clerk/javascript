import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { styles } from '../profile-page.styles';
import { mergeStyleProps, themeProps } from '../props';
import type { OrganizationProfilePanelId } from './organization-profile-sidebar';
import { OrganizationProfileSidebar } from './organization-profile-sidebar';

export type OrganizationPagePanels = Partial<Record<OrganizationProfilePanelId, ReactElement>> & {
  general: ReactElement;
};

export interface OrganizationPageViewProps {
  activePanel: OrganizationProfilePanelId;
  panels: OrganizationPagePanels;
  onPanelChange: (panel: OrganizationProfilePanelId) => void;
  renderBranding?: boolean;
}

const panelOrder: OrganizationProfilePanelId[] = ['general', 'members', 'security', 'billing', 'api-keys'];

function getAvailablePanels(panels: OrganizationPagePanels): OrganizationProfilePanelId[] {
  return panelOrder.filter(panel => Boolean(panels[panel]));
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
        <div {...stylex.props(styles.content)}>{panels[resolvedPanel] ?? panels.general}</div>
      </main>
    </div>
  );
}
