import type { ReactElement, ReactNode, Ref } from 'react';

import { Panel } from '../../components/panel';
import { themeProps } from '../../props';
import type {
  UserProfileAccountSectionViewProps,
  UserProfileEmail,
  UserProfilePhone,
} from './user-profile-account-section/user-profile-account-section.view';
import { UserProfileAccountSectionView } from './user-profile-account-section/user-profile-account-section.view';
import type { UserProfileConnectedAccount } from './user-profile-connected-accounts-section/user-profile-connected-accounts-section.view';
import type { UserProfileWeb3Wallet } from './user-profile-web3-wallets-section.view';

export type { UserProfileConnectedAccount, UserProfileEmail, UserProfilePhone, UserProfileWeb3Wallet };
export type { UserProfileNameAttribute } from './user-profile-account-section/user-profile-account-section.types';
export type { UserProfileEditNameValue } from './user-profile-account-section/user-profile-edit-name.dialog';

export interface UserProfileProfilePanelViewProps extends UserProfileAccountSectionViewProps {
  titleRef?: Ref<HTMLDivElement>;
  connectedAccountsSlot?: ReactNode;
  web3WalletsSlot?: ReactNode;
  deleteAccountSlot?: ReactNode;
}

export function UserProfileProfilePanelView({
  name = '',
  titleRef,
  connectedAccountsSlot,
  web3WalletsSlot,
  deleteAccountSlot,
  ...account
}: UserProfileProfilePanelViewProps): ReactElement {
  return (
    <Panel.Root render={<div {...themeProps('user-profile-profile-panel')} />}>
      <Panel.Title
        ref={titleRef}
        tabIndex={-1}
      >
        Account
      </Panel.Title>
      <Panel.Sections>
        <UserProfileAccountSectionView
          name={name}
          {...account}
        />
        {connectedAccountsSlot}
        {web3WalletsSlot}
        {deleteAccountSlot}
      </Panel.Sections>
    </Panel.Root>
  );
}
