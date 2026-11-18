import type { ReactNode } from 'react';

import { Panel } from '../../../components/panel';
import { useMessages } from '../../../localization';
import { themeProps } from '../../../props';

export interface OrganizationProfileSecurityPanelViewProps {
  children: ReactNode;
}

export function OrganizationProfileSecurityPanelView({ children }: OrganizationProfileSecurityPanelViewProps) {
  const m = useMessages('organizationProfile');
  return (
    <Panel.Root render={<div {...themeProps('organization-profile-security-panel')} />}>
      <Panel.Title>{m.pages.security}</Panel.Title>
      <Panel.Sections>{children}</Panel.Sections>
    </Panel.Root>
  );
}
