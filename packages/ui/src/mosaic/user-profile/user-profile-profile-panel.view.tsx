import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Profile } from '../components/profile';
import { mergeStyleProps, themeProps } from '../props';
import type {
  UserProfileAccountSectionViewProps,
  UserProfileEmail,
  UserProfilePhone,
} from './user-profile-account-section.view';
import { UserProfileAccountSectionView } from './user-profile-account-section.view';
import type { UserProfileConnectedAccount } from './user-profile-connected-accounts-section.view';
import { UserProfileConnectedAccountsSectionView } from './user-profile-connected-accounts-section.view';
import { UserProfileDeleteSectionView } from './user-profile-delete-section/user-profile-delete-section.view';
import { styles } from './user-profile-profile-panel.styles';
import type { UserProfileWeb3Wallet } from './user-profile-web3-wallets-section.view';
import { UserProfileWeb3WalletsSectionView } from './user-profile-web3-wallets-section.view';

export type { UserProfileConnectedAccount, UserProfileEmail, UserProfilePhone, UserProfileWeb3Wallet };

export interface UserProfileProfilePanelViewProps extends UserProfileAccountSectionViewProps {
  connectedAccounts?: UserProfileConnectedAccount[];
  web3Wallets?: UserProfileWeb3Wallet[];
  onConnectAccount?: (id: string) => void;
  onManageConnectedAccount?: (id: string) => void;
  onRemoveConnectedAccount?: (id: string) => void;
  onConnectWeb3Wallet?: (id: string) => void;
  onManageWeb3Wallet?: (id: string) => void;
  onSetPrimaryWeb3Wallet?: (id: string) => void;
  onRemoveWeb3Wallet?: (id: string) => void;
  /** Resolve to close the danger zone's confirmation dialog, reject to show why it failed. */
  onDeleteAccount?: () => Promise<void>;
}

export function UserProfileProfilePanelView({
  allowMultipleAccounts,
  imageUrl,
  name = '',
  username = '',
  emails = [],
  phones = [],
  connectedAccounts = [],
  web3Wallets = [],
  onEditProfilePicture,
  onNameChange,
  onUsernameChange,
  onAddEmail,
  onManageEmail,
  onVerifyEmail,
  onSetPrimaryEmail,
  onRemoveEmail,
  onAddPhone,
  onManagePhone,
  onVerifyPhone,
  onSetPrimaryPhone,
  onRemovePhone,
  onConnectAccount,
  onManageConnectedAccount,
  onRemoveConnectedAccount,
  onConnectWeb3Wallet,
  onManageWeb3Wallet,
  onSetPrimaryWeb3Wallet,
  onRemoveWeb3Wallet,
  onDeleteAccount,
}: UserProfileProfilePanelViewProps): ReactElement {
  return (
    <div {...mergeStyleProps(themeProps('user-profile-profile-panel'), stylex.props(styles.root))}>
      <Profile.PageTitle>Account</Profile.PageTitle>
      <div {...stylex.props(styles.sections)}>
        <UserProfileAccountSectionView
          allowMultipleAccounts={allowMultipleAccounts}
          emails={emails}
          imageUrl={imageUrl}
          name={name}
          phones={phones}
          username={username}
          onAddEmail={onAddEmail}
          onAddPhone={onAddPhone}
          onEditProfilePicture={onEditProfilePicture}
          onManageEmail={onManageEmail}
          onManagePhone={onManagePhone}
          onRemoveEmail={onRemoveEmail}
          onRemovePhone={onRemovePhone}
          onSetPrimaryEmail={onSetPrimaryEmail}
          onSetPrimaryPhone={onSetPrimaryPhone}
          onVerifyEmail={onVerifyEmail}
          onVerifyPhone={onVerifyPhone}
          onNameChange={onNameChange}
          onUsernameChange={onUsernameChange}
        />
        {connectedAccounts.length > 0 ? (
          <UserProfileConnectedAccountsSectionView
            accounts={connectedAccounts}
            onConnect={onConnectAccount}
            onManage={onManageConnectedAccount}
            onRemove={onRemoveConnectedAccount}
          />
        ) : null}
        {web3Wallets.length > 0 ? (
          <UserProfileWeb3WalletsSectionView
            wallets={web3Wallets}
            onConnect={onConnectWeb3Wallet}
            onManage={onManageWeb3Wallet}
            onRemove={onRemoveWeb3Wallet}
            onSetPrimary={onSetPrimaryWeb3Wallet}
          />
        ) : null}
        {onDeleteAccount ? <UserProfileDeleteSectionView onDelete={onDeleteAccount} /> : null}
      </div>
    </div>
  );
}
