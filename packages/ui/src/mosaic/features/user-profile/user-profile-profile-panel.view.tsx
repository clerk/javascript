import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Profile } from '../../components/profile';
import { mergeStyleProps, themeProps } from '../../props';
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
import { UserProfileDeleteSectionView } from './user-profile-delete-section/user-profile-delete-section.view';
import { styles } from './user-profile-profile-panel.styles';
import type { UserProfileWeb3Provider, UserProfileWeb3Wallet } from './user-profile-web3-wallets-section.view';
import { UserProfileWeb3WalletsSectionView } from './user-profile-web3-wallets-section.view';

export type { UserProfileConnectedAccount, UserProfileEmail, UserProfilePhone, UserProfileWeb3Wallet };
export type {
  UserProfileFormError,
  UserProfileNameAttribute,
} from './user-profile-account-section/user-profile-account-section.types';
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
  onRemoveWeb3Wallet?: (id: string) => void;
  /** Resolve to close the danger zone's confirmation dialog, reject to show why it failed. */
  onDeleteAccount?: () => Promise<void>;
}

export function UserProfileProfilePanelView({
  allowMultipleAccounts,
  imageUrl,
  hasImage,
  name = '',
  username = '',
  firstName,
  lastName,
  firstNameAttribute,
  lastNameAttribute,
  emails = [],
  phones = [],
  connectedAccounts = [],
  availableConnectionProviders = [],
  onReconnectAccount,
  web3Wallets = [],
  availableWeb3Providers = [],
  onProfilePictureChange,
  onProfilePictureReject,
  onRemoveProfilePicture,
  onSubmitName,
  onSubmitUsername,
  onAddEmail,
  onSendEmailCode,
  onVerifyEmailCode,
  onManageEmail,
  onVerifyEmail,
  onSetPrimaryEmail,
  onRemoveEmail,
  onSendPhoneCode,
  onVerifyPhoneCode,
  onManagePhone,
  onVerifyPhone,
  onSetPrimaryPhone,
  onRemovePhone,
  onConnectAccount,
  onRemoveConnectedAccount,
  onConnectWeb3Wallet,
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
          firstName={firstName}
          firstNameAttribute={firstNameAttribute}
          hasImage={hasImage}
          imageUrl={imageUrl}
          lastName={lastName}
          lastNameAttribute={lastNameAttribute}
          name={name}
          phones={phones}
          username={username}
          onAddEmail={onAddEmail}
          onSendPhoneCode={onSendPhoneCode}
          onVerifyPhoneCode={onVerifyPhoneCode}
          onSendEmailCode={onSendEmailCode}
          onVerifyEmailCode={onVerifyEmailCode}
          onManageEmail={onManageEmail}
          onManagePhone={onManagePhone}
          onProfilePictureChange={onProfilePictureChange}
          onProfilePictureReject={onProfilePictureReject}
          onRemoveEmail={onRemoveEmail}
          onRemovePhone={onRemovePhone}
          onRemoveProfilePicture={onRemoveProfilePicture}
          onSetPrimaryEmail={onSetPrimaryEmail}
          onSetPrimaryPhone={onSetPrimaryPhone}
          onVerifyEmail={onVerifyEmail}
          onVerifyPhone={onVerifyPhone}
          onSubmitName={onSubmitName}
          onSubmitUsername={onSubmitUsername}
        />
        <UserProfileConnectedAccountsSectionView
          accounts={connectedAccounts}
          availableProviders={availableConnectionProviders}
          onReconnect={onReconnectAccount}
          onConnect={onConnectAccount}
          onRemove={onRemoveConnectedAccount}
        />
        {web3Wallets.length > 0 || (availableWeb3Providers.length > 0 && onConnectWeb3Wallet) ? (
          <UserProfileWeb3WalletsSectionView
            wallets={web3Wallets}
            availableProviders={availableWeb3Providers}
            onConnect={onConnectWeb3Wallet}
            onRemove={onRemoveWeb3Wallet}
            onSetPrimary={onSetPrimaryWeb3Wallet}
          />
        ) : null}
        {onDeleteAccount ? <UserProfileDeleteSectionView onDelete={onDeleteAccount} /> : null}
      </div>
    </div>
  );
}
