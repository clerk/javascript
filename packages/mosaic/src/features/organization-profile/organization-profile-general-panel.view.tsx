import type { ReactElement, ReactNode } from 'react';

import { Panel } from '../../components/panel';
import { useMessages } from '../../localization';
import { themeProps } from '../../props';

export interface OrganizationProfileGeneralPanelViewProps {
  children?: ReactNode;
}

export function OrganizationProfileGeneralPanelView({
  children,
}: OrganizationProfileGeneralPanelViewProps): ReactElement {
  const m = useMessages('organizationProfile');

  return (
    <Panel.Root render={<div {...themeProps('organization-profile-general-panel')} />}>
      <Panel.Title>{m.pages.general}</Panel.Title>
      <Panel.Sections>{children}</Panel.Sections>
    </Panel.Root>
  );
}
