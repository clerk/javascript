import type { ReactElement, ReactNode } from 'react';
import { useRef } from 'react';

import { Panel } from '../../components/panel';
import { themeProps } from '../../props';
import type {
  UserProfileAccountSectionViewProps,
  UserProfileEmail,
  UserProfilePhone,
} from './user-profile-account-section/user-profile-account-section.view';
import { UserProfileAccountSectionView } from './user-profile-account-section/user-profile-account-section.view';
import type {
  UserProfileConnectedAccount,
  UserProfileConnectionProvider,
} from './user-profile-connected-accounts-section.view';
import { UserProfileConnectedAccountsSectionView } from './user-profile-connected-accounts-section.view';
import type { UserProfileWeb3Provider, UserProfileWeb3Wallet } from './user-profile-web3-wallets-section.view';
import { UserProfileWeb3WalletsSectionView } from './user-profile-web3-wallets-section.view';

export type { UserProfileConnectedAccount, UserProfileEmail, UserProfilePhone, UserProfileWeb3Wallet };
export type { UserProfileNameAttribute } from './user-profile-account-section/user-profile-account-section.types';
export type { UserProfileEditNameValue } from './user-profile-account-section/user-profile-edit-name.dialog';

export interface UserProfileProfilePanelViewProps extends UserProfileAccountSectionViewProps {
  connectedAccounts?: UserProfileConnectedAccount[];
  availableConnectionProviders?: UserProfileConnectionProvider[];
  onReconnectAccount?: (id: string) => void;
  web3Wallets?: UserProfileWeb3Wallet[];
  availableWeb3Providers?: UserProfileWeb3Provider[];
  onConnectAccount?: (id: string) => void;
  onRemoveConnectedAccount?: (id: string) => void | Promise<void>;
  onConnectWeb3Wallet?: (id: string) => void;
  onSetPrimaryWeb3Wallet?: (id: string) => void;
  onRemoveWeb3Wallet?: (id: string) => void | Promise<void>;
  /** Danger zone. Omit to hide it. */
  deleteAccountSlot?: ReactNode;
}

export function UserProfileProfilePanelView({
  name = '',
  connectedAccounts = [],
  availableConnectionProviders = [],
  onReconnectAccount,
  web3Wallets = [],
  availableWeb3Providers = [],
  onConnectAccount,
  onRemoveConnectedAccount,
  onConnectWeb3Wallet,
  onSetPrimaryWeb3Wallet,
  onRemoveWeb3Wallet,
  deleteAccountSlot,
  ...account
}: UserProfileProfilePanelViewProps): ReactElement {
  const pageTitle = useRef<HTMLDivElement>(null);
  return (
    <Panel.Root render={<div {...themeProps('user-profile-profile-panel')} />}>
      <Panel.Title
        ref={pageTitle}
        tabIndex={-1}
      >
        Account
      </Panel.Title>
      <Panel.Sections>
        <UserProfileAccountSectionView
          name={name}
          {...account}
        />
        <UserProfileConnectedAccountsSectionView
          fallbackFocus={() => pageTitle.current}
          accounts={connectedAccounts}
          availableProviders={availableConnectionProviders}
          onReconnect={onReconnectAccount}
          onConnect={onConnectAccount}
          onRemove={onRemoveConnectedAccount}
        />
        <UserProfileWeb3WalletsSectionView
          fallbackFocus={() => pageTitle.current}
          wallets={web3Wallets}
          availableProviders={availableWeb3Providers}
          onConnect={onConnectWeb3Wallet}
          onRemove={onRemoveWeb3Wallet}
          onSetPrimary={onSetPrimaryWeb3Wallet}
        />
        {deleteAccountSlot}
      </Panel.Sections>
    </Panel.Root>
  );
}
