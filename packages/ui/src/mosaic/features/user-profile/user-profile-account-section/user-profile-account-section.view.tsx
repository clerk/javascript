import type { FileRejection } from '@clerk/headless/file-upload';
import * as stylex from '@stylexjs/stylex';
import { useMemo, useRef, useState } from 'react';

import { createConfirmHandle, Dialog } from '../../../components/dialog';
import { Text } from '../../../components/text';
import { Section } from '../../../components/section';
import { fill, userProfileAccountSectionBase as m } from './user-profile-account-section.messages';
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
        <EmailContactSection
              items={emails}
              kind='email'
              label={m.email.label}
              onAdd={onAddEmail}
              onRemove={onRemoveEmail}
              onSetPrimary={onSetPrimaryEmail}
              onVerify={onVerifyEmail}
            />
      ) : null}
      {allowMultipleAccounts ? (
        <Section.Root aria-label={m.phone.label}>
          <Section.Group>{phoneRow}</Section.Group>
        </Section.Root>
      ) : null}
    </div>
  );
}

interface ContactSectionProps {
  kind: 'email' | 'phone';
  label: string;
  items: Array<{ id: string; value: string; isDefault?: boolean; isVerified?: boolean; canRemove?: boolean }>;
  onAdd?: () => void;
  onManage?: (id: string) => void;
  onVerify?: (id: string) => void;
  onSetPrimary?: (id: string) => void | Promise<void>;
  onRemove?: (id: string) => void | Promise<void>;
}

function EmailContactSection(props: ContactSectionProps) {
  const { items, onSetPrimary, onRemove } = props;
  const messages = m.email;
  const sectionRef = useRef<HTMLElement>(null);
  const removeConfirm = useMemo(() => createConfirmHandle(), []);
  const [contactToRemove, setContactToRemove] = useState<ContactSectionProps['items'][number]>();
  const [removeError, setRemoveError] = useState<string>();
  const removing = useRef(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);
  const [primaryError, setPrimaryError] = useState<string>();
  const settingPrimary = useRef(false);

  const setPrimary = async (id: string) => {
    const contact = items.find(item => item.id === id);
    if (!onSetPrimary || !contact?.isVerified || contact.isDefault || settingPrimary.current) {
      return;
    }
    settingPrimary.current = true;
    setIsSettingPrimary(true);
    setPrimaryError(undefined);
    try {
      await onSetPrimary(id);
    } catch (error) {
      setPrimaryError(error instanceof Error ? error.message : messages.primaryError);
    } finally {
      settingPrimary.current = false;
      setIsSettingPrimary(false);
    }
  };

  const removeContact = async (id: string) => {
    const contact = items.find(item => item.id === id);
    if (!contact || contact.canRemove === false || !onRemove || removing.current) {
      return;
    }
    removing.current = true;
    setContactToRemove(contact);
    setRemoveError(undefined);
    try {
      const [beforeEmail, afterEmail] = messages.removeDialog.description.split('{emailAddress}');
      const confirmed = await removeConfirm.show({
        title: messages.removeDialog.title,
        description: (
          <>
            {beforeEmail}
            <strong {...stylex.props(styles.confirmationContactValue)}>{contact.value}</strong>
            {afterEmail}
          </>
        ),
        actionLabel: messages.removeDialog.confirm,
        cancelLabel: messages.removeDialog.cancel,
        destructive: true,
      });
      if (confirmed) {
        await onRemove(id);
      }
    } catch (error) {
      setRemoveError(error instanceof Error ? error.message : messages.removeError);
    } finally {
      removing.current = false;
    }
  };

  return (
    <Section.Root
      ref={sectionRef}
      aria-label={props.label}
    >
      <Section.Group>
        <UserProfileContactListRowView
          {...props}
          onManage={isSettingPrimary ? undefined : props.onManage}
          onSetPrimary={onSetPrimary && !isSettingPrimary ? id => void setPrimary(id) : undefined}
          onRemove={onRemove ? id => void removeContact(id) : undefined}
        />
      </Section.Group>
      {primaryError ? (
        <Text
          role='alert'
          color='negative'
        >
          {primaryError}
        </Text>
      ) : null}
      {removeError ? (
        <Text
          role='alert'
          color='negative'
        >
          {removeError}
        </Text>
      ) : null}
      <Dialog.Confirm
        handle={removeConfirm}
        finalFocus={() => {
          const buttons = Array.from(sectionRef.current?.querySelectorAll('button') ?? []);
          const label = contactToRemove ? fill(m.manageValue, { value: contactToRemove.value }) : '';
          return (
            buttons.find(button => button.getAttribute('aria-label') === label) ??
            buttons.find(button => button.getAttribute('aria-label') === messages.add) ??
            buttons[0] ??
            false
          );
        }}
      />
    </Section.Root>
  );
}

