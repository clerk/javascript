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
export type {
  UserProfileFormError,
  UserProfileNameAttribute,
} from './user-profile-account-section/user-profile-account-section.types';
export type { UserProfileEditNameValue } from './user-profile-account-section/user-profile-edit-name.dialog';

export interface UserProfileProfilePanelViewProps extends UserProfileAccountSectionViewProps {
  titleRef?: Ref<HTMLDivElement>;
  connectedAccountsSlot?: ReactNode;
  web3WalletsSlot?: ReactNode;
  deleteAccountSlot?: ReactNode;
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
  titleRef,
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
  connectedAccountsSlot,
  web3WalletsSlot,
  deleteAccountSlot,
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
        {connectedAccountsSlot}
        {web3WalletsSlot}
        {deleteAccountSlot}
      </Panel.Sections>
    </Panel.Root>
  );
}
