import type { FileRejection } from '@clerk/headless/file-upload';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';
import { useRef, useState } from 'react';

import { stringToFormattedPhoneString } from '../../../utils/phoneUtils';
import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { Section } from '../../components/section';
import { Text } from '../../components/text';
import { userProfileAccountSectionBase as m } from './user-profile-account-section.messages';
import { styles } from './user-profile-account-section.styles';
import type { UserProfileNameAttribute } from './user-profile-account-section.types';
import type { UserProfileAddPhoneControllerOptions } from './user-profile-add-phone.controller';
import { useUserProfileAddPhoneController } from './user-profile-add-phone.controller';
import { UserProfileAddPhoneView } from './user-profile-add-phone.view';
import { UserProfileContactListRowView } from './user-profile-contact-list-row.view';
import { UserProfileContactRowView } from './user-profile-contact-row.view';
import type { UserProfileEditNameValue } from './user-profile-edit-name.dialog';
import { UserProfileNameRowView } from './user-profile-name-row.view';
import { UserProfilePictureRowView } from './user-profile-picture-row.view';
import { UserProfileRemovePhoneView } from './user-profile-remove-phone.view';
import { UserProfileUsernameRowView } from './user-profile-username-row.view';

export interface UserProfileEmail {
  id: string;
  value: string;
  isDefault?: boolean;
  isVerified?: boolean;
  canRemove?: boolean;
}

export interface UserProfilePhone {
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
  const addPhoneTriggerRef = useRef<HTMLButtonElement>(null);
  const addPhoneAction =
    onSendPhoneCode && onVerifyPhoneCode ? (
      <AddPhone
        options={{ onSend: onSendPhoneCode, onVerify: onVerifyPhoneCode }}
        compact={allowMultipleAccounts}
        triggerRef={addPhoneTriggerRef}
      />
    ) : undefined;
  const confirmedRemoval = useRef(false);
  const [phoneToRemove, setPhoneToRemove] = useState<UserProfilePhone>();
  const [removeError, setRemoveError] = useState<string>();
  const removing = useRef(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);
  const [primaryError, setPrimaryError] = useState<string>();
  const settingPrimary = useRef(false);

  const setPrimaryPhone = async (id: string) => {
    const phone = phones.find(phone => phone.id === id);
    if (!onSetPrimaryPhone || !phone?.isVerified || phone.isDefault || settingPrimary.current) {
      return;
    }
    settingPrimary.current = true;
    setIsSettingPrimary(true);
    setPrimaryError(undefined);
    try {
      await onSetPrimaryPhone(id);
    } catch (error) {
      setPrimaryError(error instanceof Error ? error.message : m.phone.primaryError);
    } finally {
      settingPrimary.current = false;
      setIsSettingPrimary(false);
    }
  };

  const removePhone = (id: string) => {
    const phone = phones.find(phone => phone.id === id);
    if (!phone || phone.canRemove === false || !onRemovePhone || removing.current) {
      return;
    }
    confirmedRemoval.current = false;
    setPhoneToRemove(phone);
    setRemoveError(undefined);
  };

  const confirmRemovePhone = async () => {
    if (!phoneToRemove || !onRemovePhone || removing.current) {
      return;
    }
    removing.current = true;
    confirmedRemoval.current = true;
    setPhoneToRemove(undefined);
    try {
      await onRemovePhone(phoneToRemove.id);
    } catch (error) {
      setRemoveError(error instanceof Error ? error.message : m.phone.removeError);
    } finally {
      removing.current = false;
    }
  };
  const formattedPhones = phones.map(phone => ({
    ...phone,
    value: stringToFormattedPhoneString(phone.value),
  }));

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
          {!allowMultipleAccounts ? (
            <UserProfileContactRowView
              items={formattedPhones}
              kind='phone'
              label={m.phone.label}
              addAction={addPhoneAction}
              onManage={onManagePhone}
            />
          ) : null}
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
          <Section.Group>
            <UserProfileContactListRowView
              items={formattedPhones}
              kind='phone'
              label={m.phone.label}
              addAction={addPhoneAction}
              onManage={isSettingPrimary ? undefined : onManagePhone}
              onRemove={onRemovePhone ? removePhone : undefined}
              onSetPrimary={onSetPrimaryPhone && !isSettingPrimary ? id => void setPrimaryPhone(id) : undefined}
              onVerify={onVerifyPhone}
              renderActionDialog={
                onRemovePhone
                  ? phone => (
                      <UserProfileRemovePhoneView
                        phoneNumber={phone.value}
                        open={phoneToRemove?.id === phone.id}
                        onOpenChange={open => {
                          if (!open) {
                            setPhoneToRemove(undefined);
                          }
                        }}
                        onConfirm={() => void confirmRemovePhone()}
                        finalFocus={() => (confirmedRemoval.current ? addPhoneTriggerRef.current : undefined)}
                      />
                    )
                  : undefined
              }
            />
          </Section.Group>
        </Section.Root>
      ) : null}
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
    </div>
  );
}

function AddPhone({
  options,
  compact,
  triggerRef,
}: {
  options: UserProfileAddPhoneControllerOptions;
  compact: boolean;
  triggerRef?: Ref<HTMLButtonElement>;
}) {
  const controller = useUserProfileAddPhoneController(options);
  return (
    <UserProfileAddPhoneView
      {...controller}
      trigger={
        <Button
          aria-label={m.phone.add}
          ref={triggerRef}
          color='neutral'
          size='sm'
          variant='outline'
        >
          {compact ? (
            <Icon
              name='plus'
              placement='inline-start'
              size='sm'
            />
          ) : null}
          {compact ? m.add : m.phone.add}
        </Button>
      }
    />
  );
}
