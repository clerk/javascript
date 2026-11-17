import type { ReactElement, ReactNode } from 'react';

import { Panel } from '../../components/panel';
import { themeProps } from '../../props';
import type { UserProfileConnectedAccount } from './user-profile-connected-accounts-section/user-profile-connected-accounts-section.view';
import type { UserProfileEmail, UserProfilePhone } from './user-profile-contact.types';
import type { UserProfileWeb3Wallet } from './user-profile-web3-wallets-section/user-profile-web3-wallets-section.types';

export type { UserProfileConnectedAccount, UserProfileEmail, UserProfilePhone, UserProfileWeb3Wallet };
export type { UserProfileNameAttribute } from './user-profile-profile-section/user-profile-profile-section.types';
export type { UserProfileEditNameValue } from './user-profile-profile-section/user-profile-edit-name.dialog';

export interface UserProfileProfilePanelViewProps {
  children?: ReactNode;
}

export function UserProfileProfilePanelView({ children }: UserProfileProfilePanelViewProps): ReactElement {
  return (
    <Panel.Root render={<div {...themeProps('user-profile-profile-panel')} />}>
      <Panel.Title>Account</Panel.Title>
      <Panel.Sections>{children}</Panel.Sections>
    </Panel.Root>
  );
}
