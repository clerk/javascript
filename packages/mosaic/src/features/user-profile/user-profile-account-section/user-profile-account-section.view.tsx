import * as stylex from '@stylexjs/stylex';

import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import type { FileRejection } from '../../../primitives/file-upload';
import { styles } from './user-profile-account-section.styles';
import type {
  UserProfileEmail,
  UserProfileNameAttribute,
  UserProfilePhone,
} from './user-profile-account-section.types';
import type { UserProfileEditNameValue } from './user-profile-edit-name.dialog';
import { UserProfileEmailRowView } from './user-profile-email-row.view';
import { UserProfileNameRowView } from './user-profile-name-row.view';
import { UserProfilePhoneRowView } from './user-profile-phone-row.view';
import { UserProfilePictureRowView } from './user-profile-picture-row.view';
import { UserProfileUsernameRowView } from './user-profile-username-row.view';

export type { UserProfileEmail, UserProfilePhone } from './user-profile-account-section.types';

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
  onSendEmailCode?: (emailAddress: string) => Promise<void>;
  onVerifyEmailCode?: (emailAddress: string, code: string) => Promise<void>;
  onManageEmail?: (id: string) => void;
  onVerifyEmail?: (id: string) => void;
  onSetPrimaryEmail?: (id: string) => void | Promise<void>;
  onRemoveEmail?: (id: string) => void | Promise<void>;
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
}: UserProfileAccountSectionViewProps) {
  const m = useMessages('userProfileAccountSection');
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
  const emailRow = (
    <UserProfileEmailRowView
      emails={emails}
      allowMultipleAccounts={allowMultipleAccounts}
      onAddEmail={onAddEmail}
      onSendEmailCode={onSendEmailCode}
      onVerifyEmailCode={onVerifyEmailCode}
      onManageEmail={onManageEmail}
      onVerifyEmail={onVerifyEmail}
      onSetPrimaryEmail={onSetPrimaryEmail}
      onRemoveEmail={onRemoveEmail}
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
          {!allowMultipleAccounts ? emailRow : null}
          {!allowMultipleAccounts ? phoneRow : null}
        </Section.Group>
      </Section.Root>
      {allowMultipleAccounts ? (
        <Section.Root aria-label={m.email.label}>
          <Section.Group>{emailRow}</Section.Group>
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
