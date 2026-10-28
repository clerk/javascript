import type { ReactElement, ReactNode } from 'react';

import { Panel } from '../../components/panel';
import { themeProps } from '../../props';

export interface UserProfileSecurityPanelViewProps {
  children?: ReactNode;
}

export function UserProfileSecurityPanelView({ children }: UserProfileSecurityPanelViewProps): ReactElement {
  return (
    <Panel.Root render={<div {...themeProps('user-profile-security-panel')} />}>
      <Panel.Title>Security</Panel.Title>
      <Panel.Sections>{children}</Panel.Sections>
    </Panel.Root>
  );
}
