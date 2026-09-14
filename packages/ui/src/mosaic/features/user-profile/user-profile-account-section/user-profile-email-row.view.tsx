import { useRef, useState } from 'react';

import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { Text } from '../../components/text';
import { userProfileAccountSectionBase as m } from './user-profile-account-section.messages';
import type { UserProfileEmail } from './user-profile-account-section.types';
import type { UserProfileAddEmailControllerOptions } from './user-profile-add-email.controller';
import { useUserProfileAddEmailController } from './user-profile-add-email.controller';
import { UserProfileAddEmailDialog } from './user-profile-add-email.dialog';
import { UserProfileContactListRowView } from './user-profile-contact-list-row.view';
import { UserProfileContactRowView } from './user-profile-contact-row.view';
import { UserProfileRemoveEmailDialog } from './user-profile-remove-email.dialog';

export interface UserProfileEmailRowViewProps {
  emails: UserProfileEmail[];
  allowMultipleAccounts?: boolean;
  onAddEmail?: () => void;
  onSendEmailCode?: (emailAddress: string) => Promise<void>;
  onVerifyEmailCode?: (emailAddress: string, code: string) => Promise<void>;
  onManageEmail?: (id: string) => void;
  onVerifyEmail?: (id: string) => void;
  onSetPrimaryEmail?: (id: string) => void | Promise<void>;
  onRemoveEmail?: (id: string) => void | Promise<void>;
}

export function UserProfileEmailRowView({
  emails,
  allowMultipleAccounts = false,
  onAddEmail,
  onSendEmailCode,
  onVerifyEmailCode,
  onManageEmail,
  onVerifyEmail,
  onSetPrimaryEmail,
  onRemoveEmail,
}: UserProfileEmailRowViewProps) {
  const addEmailAction =
    onSendEmailCode && onVerifyEmailCode ? (
      <AddEmail
        options={{ onSend: onSendEmailCode, onVerify: onVerifyEmailCode }}
        compact={allowMultipleAccounts}
      />
    ) : onAddEmail ? (
      <Button
        onClick={onAddEmail}
        aria-label={m.email.add}
        color='neutral'
        size='sm'
        variant='outline'
      >
        {allowMultipleAccounts ? (
          <Icon
            name='plus'
            placement='inline-start'
            size='sm'
          />
        ) : null}
        {allowMultipleAccounts ? m.add : m.email.add}
      </Button>
    ) : undefined;
  const [emailToRemove, setEmailToRemove] = useState<UserProfileEmail>();
  const [removeError, setRemoveError] = useState<string>();
  const removing = useRef(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);
  const [primaryError, setPrimaryError] = useState<string>();
  const settingPrimary = useRef(false);

  const setPrimaryEmail = async (id: string) => {
    const email = emails.find(email => email.id === id);
    if (!onSetPrimaryEmail || !email?.isVerified || email.isDefault || settingPrimary.current) {
      return;
    }
    settingPrimary.current = true;
    setIsSettingPrimary(true);
    setPrimaryError(undefined);
    try {
      await onSetPrimaryEmail(id);
    } catch (error) {
      setPrimaryError(error instanceof Error ? error.message : m.email.primaryError);
    } finally {
      settingPrimary.current = false;
      setIsSettingPrimary(false);
    }
  };

  const removeEmail = (id: string) => {
    const email = emails.find(email => email.id === id);
    if (!email || email.canRemove === false || !onRemoveEmail || removing.current) {
      return;
    }
    setEmailToRemove(email);
    setRemoveError(undefined);
  };

  const confirmRemoveEmail = async () => {
    if (!emailToRemove || !onRemoveEmail || removing.current) {
      return;
    }
    removing.current = true;
    setEmailToRemove(undefined);
    try {
      await onRemoveEmail(emailToRemove.id);
    } catch (error) {
      setRemoveError(error instanceof Error ? error.message : m.email.removeError);
    } finally {
      removing.current = false;
    }
  };

  if (!allowMultipleAccounts) {
    return (
      <UserProfileContactRowView
        items={emails}
        kind='email'
        label={m.email.label}
        addAction={addEmailAction}
        onManage={onManageEmail}
      />
    );
  }

  return (
    <>
      <UserProfileContactListRowView
        items={emails}
        kind='email'
        label={m.email.label}
        addAction={addEmailAction}
        onRemove={onRemoveEmail ? removeEmail : undefined}
        onSetPrimary={onSetPrimaryEmail && !isSettingPrimary ? id => void setPrimaryEmail(id) : undefined}
        onVerify={onVerifyEmail}
        renderActionDialog={
          onRemoveEmail
            ? email => (
                <UserProfileRemoveEmailDialog
                  emailAddress={email.value}
                  open={emailToRemove?.id === email.id}
                  onOpenChange={open => {
                    if (!open) {
                      setEmailToRemove(undefined);
                    }
                  }}
                  onConfirm={() => void confirmRemoveEmail()}
                />
              )
            : undefined
        }
      />
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
    </>
  );
}

function AddEmail({ options, compact }: { options: UserProfileAddEmailControllerOptions; compact: boolean }) {
  const controller = useUserProfileAddEmailController(options);
  return (
    <UserProfileAddEmailDialog
      {...controller}
      trigger={
        <Button
          aria-label={m.email.add}
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
          {compact ? m.add : m.email.add}
        </Button>
      }
    />
  );
}
