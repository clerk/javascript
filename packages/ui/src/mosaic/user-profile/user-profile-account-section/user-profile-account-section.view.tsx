import type { FileRejection } from '@clerk/headless/file-upload';
import * as stylex from '@stylexjs/stylex';

import { Section } from '../../components/section';
import { userProfileAccountSectionBase as m } from './user-profile-account-section.messages';
import { styles } from './user-profile-account-section.styles';
import type { UserProfileNameAttribute, UserProfilePhone } from './user-profile-account-section.types';
import { UserProfileContactListRowView } from './user-profile-contact-list-row.view';
import { UserProfileContactRowView } from './user-profile-contact-row.view';
import type { UserProfileEditNameValue } from './user-profile-edit-name.dialog';
import { UserProfileNameRowView } from './user-profile-name-row.view';
import { UserProfilePhoneRowView } from './user-profile-phone-row.view';
import { UserProfilePictureRowView } from './user-profile-picture-row.view';
import { UserProfileUsernameRowView } from './user-profile-username-row.view';

export type { UserProfilePhone } from './user-profile-account-section.types';

export interface UserProfileEmail {
  id: string;
  value: string;
  isDefault?: boolean;
  isVerified?: boolean;
  canRemove?: boolean;
}

export interface UserProfileAccountSectionViewProps {
  allowMultipleAccounts?: boolean;
  imageUrl?: string;
  /**
   * Whether `imageUrl` is a picture the user uploaded. Clerk's image service always returns a URL —
   * a generated initials avatar when none was uploaded — so the row cannot tell the two apart from
   * `imageUrl` alone. Supplied from `user.hasImage`.
   */
  hasImage?: boolean;
  name: string;
  username: string;
  /** Passed alongside `name`, which cannot be split back into its two halves. */
  firstName?: string;
  lastName?: string;
  firstNameAttribute?: UserProfileNameAttribute;
  lastNameAttribute?: UserProfileNameAttribute;
  emails: UserProfileEmail[];
  phones: UserProfilePhone[];
  onProfilePictureChange?: (file: File) => void;
  onProfilePictureReject?: (rejections: FileRejection[]) => void;
  onRemoveProfilePicture?: () => void;
  onSubmitName?: (value: UserProfileEditNameValue) => Promise<void>;
  onSubmitUsername?: (username: string) => Promise<void>;
  onAddEmail?: () => void;
  onManageEmail?: (id: string) => void;
  onVerifyEmail?: (id: string) => void;
  onSetPrimaryEmail?: (id: string) => void;
  onRemoveEmail?: (id: string) => void;
  onSendPhoneCode?: (phoneNumber: string) => Promise<void>;
  onVerifyPhoneCode?: (phoneNumber: string, code: string) => Promise<void>;
  onManagePhone?: (id: string) => void;
  onVerifyPhone?: (id: string) => void;
  onSetPrimaryPhone?: (id: string) => void | Promise<void>;
  onRemovePhone?: (id: string) => void | Promise<void>;
}

export function UserProfileAccountSectionView({
  allowMultipleAccounts = false,
  imageUrl,
  hasImage = false,
  name,
  username,
  firstName,
  lastName,
  firstNameAttribute,
  lastNameAttribute,
  emails,
  phones,
  onProfilePictureChange,
  onProfilePictureReject,
  onRemoveProfilePicture,
  onSubmitName,
  onSubmitUsername,
  onAddEmail,
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
}: UserProfileAccountSectionViewProps) {
  const phoneRow = (
    <UserProfilePhoneRowView
      phones={phones}
      allowMultipleAccounts={allowMultipleAccounts}
      onSendPhoneCode={onSendPhoneCode}
      onVerifyPhoneCode={onVerifyPhoneCode}
      onManagePhone={onManagePhone}
      onVerifyPhone={onVerifyPhone}
      onSetPrimaryPhone={onSetPrimaryPhone}
      onRemovePhone={onRemovePhone}
    />
  );

  return (
    <div {...stylex.props(styles.sections)}>
      <Section.Root aria-label={m.sectionLabel}>
        <Section.Title>{m.sectionTitle}</Section.Title>
        <Section.Group>
          <UserProfilePictureRowView
            name={name}
            imageUrl={imageUrl}
            hasImage={hasImage}
            onChange={onProfilePictureChange}
            onReject={onProfilePictureReject}
            onRemove={onRemoveProfilePicture}
          />
          <UserProfileNameRowView
            name={name}
            firstName={firstName}
            lastName={lastName}
            firstNameAttribute={firstNameAttribute}
            lastNameAttribute={lastNameAttribute}
            onSubmit={onSubmitName}
          />
          <UserProfileUsernameRowView
            username={username}
            onSubmit={onSubmitUsername}
          />
          {!allowMultipleAccounts ? (
            <UserProfileContactRowView
              items={emails}
              kind='email'
              label={m.email.label}
              onAdd={onAddEmail}
              onManage={onManageEmail}
            />
          ) : null}
          {!allowMultipleAccounts ? phoneRow : null}
        </Section.Group>
      </Section.Root>
      {allowMultipleAccounts ? (
        <Section.Root aria-label={m.email.label}>
          <Section.Group>
            <UserProfileContactListRowView
              items={emails}
              kind='email'
              label={m.email.label}
              onAdd={onAddEmail}
              onManage={onManageEmail}
              onRemove={onRemoveEmail}
              onSetPrimary={onSetPrimaryEmail}
              onVerify={onVerifyEmail}
            />
          </Section.Group>
        </Section.Root>
      ) : null}
      {allowMultipleAccounts ? (
        <Section.Root aria-label={m.phone.label}>
          <Section.Group>{phoneRow}</Section.Group>
        </Section.Root>
      ) : null}
    </div>
  );
}
