import type { ReactElement, ReactNode } from 'react';

import { Panel } from '../../components/panel';
import { themeProps } from '../../props';
import type { UserProfileDevice } from './user-profile-active-devices-section/user-profile-active-devices-section.view';
import type {
  UserProfileMfaAddableMethod,
  UserProfileMfaMethod,
} from './user-profile-mfa-section/user-profile-mfa-section.view';
import type { UserProfilePasskey } from './user-profile-passkeys-section.view';

export type { UserProfileDevice, UserProfileMfaAddableMethod, UserProfileMfaMethod, UserProfilePasskey };

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
