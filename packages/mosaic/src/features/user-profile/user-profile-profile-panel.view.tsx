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
import { UserProfileDeleteSectionView } from './user-profile-delete-section/user-profile-delete-section.view';
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
  /** Connected accounts section. Replaces the one built from `connectedAccounts` and its callbacks. */
  connectedAccountsSlot?: ReactNode;
  onConnectWeb3Wallet?: (id: string) => void;
  onSetPrimaryWeb3Wallet?: (id: string) => void;
  onRemoveWeb3Wallet?: (id: string) => void | Promise<void>;
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
  connectedAccountsSlot,
  onConnectWeb3Wallet,
  onSetPrimaryWeb3Wallet,
  onRemoveWeb3Wallet,
  onDeleteAccount,
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
        {connectedAccountsSlot ?? (
          <UserProfileConnectedAccountsSectionView
            fallbackFocus={() => pageTitle.current}
            accounts={connectedAccounts}
            availableProviders={availableConnectionProviders}
            onReconnect={onReconnectAccount}
            onConnect={onConnectAccount}
            onRemove={onRemoveConnectedAccount}
          />
        )}
        <UserProfileWeb3WalletsSectionView
          fallbackFocus={() => pageTitle.current}
          wallets={web3Wallets}
          availableProviders={availableWeb3Providers}
          onConnect={onConnectWeb3Wallet}
          onRemove={onRemoveWeb3Wallet}
          onSetPrimary={onSetPrimaryWeb3Wallet}
        />
        {onDeleteAccount ? <UserProfileDeleteSectionView onDelete={onDeleteAccount} /> : null}
      </Panel.Sections>
    </Panel.Root>
  );
}
