import { useMemo, useRef } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { Icon } from '../../../components/icon';
import { Text } from '../../../components/text';
import { useListRemovalFocus } from '../../../hooks/useListRemovalFocus';
import { fill, useMessages } from '../../../localization';
import type { UserProfileEmail, UserProfileEmailVerifier } from './user-profile-account-section.types';
import { useUserProfileAddEmailController } from './user-profile-add-email.controller';
import { UserProfileAddEmailDialog } from './user-profile-add-email.dialog';
import { UserProfileContactListRowView } from './user-profile-contact-list-row.view';
import { UserProfileContactRowView } from './user-profile-contact-row.view';
import { useUserProfileSetPrimaryController } from './user-profile-set-primary.controller';

export interface UserProfileEmailRowViewProps {
  emails: UserProfileEmail[];
  allowMultipleAccounts?: boolean;
  onAddEmail?: () => void;
  onCreateEmail?: (emailAddress: string) => Promise<UserProfileEmailVerifier>;
  getEmailVerifier?: (id: string) => UserProfileEmailVerifier;
  onManageEmail?: (id: string) => void;
  onVerifyEmail?: (id: string) => void;
  onSetPrimaryEmail?: (id: string) => void | Promise<void>;
  onRemoveEmail?: (id: string) => void | Promise<void>;
}

export function UserProfileEmailRowView({
  emails,
  allowMultipleAccounts = false,
  onAddEmail,
  onCreateEmail,
  getEmailVerifier,
  onManageEmail,
  onVerifyEmail,
  onSetPrimaryEmail,
  onRemoveEmail,
}: UserProfileEmailRowViewProps) {
  const m = useMessages('userProfileAccountSection');
  const row = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: emails.map(email => email.id),
    onRemove: onRemoveEmail,
    fallback: () => row.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? row.current,
  });
  const verification = useUserProfileAddEmailController({ onCreate: onCreateEmail });
  const verificationDialog = useMemo(() => Dialog.createHandle(), []);
  const canVerify = Boolean(getEmailVerifier);
  const addEmailLabel = (
    <>
      {allowMultipleAccounts ? (
        <Icon
          name='plus'
          placement='inline-start'
          size='sm'
        />
      ) : null}
      {allowMultipleAccounts ? m.add : m.email.add}
    </>
  );
  const addEmailAction =
    canVerify && onCreateEmail ? (
      <Dialog.Trigger
        handle={verificationDialog}
        render={
          <Button
            aria-label={m.email.add}
            color='neutral'
            size='sm'
            variant='outline'
          />
        }
      >
        {addEmailLabel}
      </Dialog.Trigger>
    ) : onAddEmail ? (
      <Button
        aria-label={m.email.add}
        color='neutral'
        size='sm'
        variant='outline'
        onClick={onAddEmail}
      >
        {addEmailLabel}
      </Button>
    ) : undefined;
  const verifyingId = useRef<string | undefined>(undefined);
  const verifyEmail = (id: string) => {
    const email = emails.find(email => email.id === id);
    if (email && getEmailVerifier) {
      verifyingId.current = id;
      verification.onVerifyEmail(email.value, getEmailVerifier(id));
    }
  };
  const removeEmailConfirmation = useMemo(() => Confirmation.createHandle<UserProfileEmail>(), []);
  const primary = useUserProfileSetPrimaryController({
    items: emails,
    onSetPrimary: onSetPrimaryEmail,
    fallbackError: m.email.primaryError,
  });

  const removeEmail = (id: string) => {
    const email = emails.find(email => email.id === id);
    if (email && onRemoveEmail) {
      removeEmailConfirmation.open(email);
    }
  };

  const dialog = canVerify ? (
    <UserProfileAddEmailDialog
      {...verification}
      handle={verificationDialog}
      finalFocus={() => {
        const id = verifyingId.current;
        verifyingId.current = undefined;
        return id ? removalFocus.trigger(id) : null;
      }}
    />
  ) : null;

  if (!allowMultipleAccounts) {
    return (
      <>
        <UserProfileContactRowView
          items={emails}
          kind='email'
          label={m.email.label}
          addAction={addEmailAction}
          onManage={onManageEmail}
        />
        {dialog}
      </>
    );
  }

  return (
    <>
      <UserProfileContactListRowView
        rowRef={row}
        triggerRef={removalFocus.registerTrigger}
        items={emails}
        kind='email'
        label={m.email.label}
        addAction={addEmailAction}
        onRemove={onRemoveEmail ? removeEmail : undefined}
        onSetPrimary={primary.onSetPrimary}
        onVerify={canVerify ? verifyEmail : onVerifyEmail}
      />
      {dialog}
      {primary.error ? (
        <Text
          role='alert'
          color='negative'
        >
          {primary.error}
        </Text>
      ) : null}
      {onRemoveEmail ? (
        <Confirmation
          handle={removeEmailConfirmation}
          title={m.email.removeDialog.title}
          description={email =>
            fill(email.isVerified ? m.email.removeDialog.verifiedDescription : m.email.removeDialog.description, {
              emailAddress: email.value,
            })
          }
          actionLabel={m.email.removeDialog.confirm}
          cancelLabel={m.email.removeDialog.cancel}
          finalFocus={removalFocus.finalFocus}
          onConfirm={email => removalFocus.remove(email.id)}
        />
      ) : null}
    </>
  );
}
