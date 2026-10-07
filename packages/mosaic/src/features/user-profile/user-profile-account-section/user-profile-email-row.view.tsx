import { useMemo, useRef } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { fill, useMessages } from '../../../localization';
import type { UserProfileEmail, UserProfileEmailVerifier } from './user-profile-account-section.types';
import { UserProfileAddEmailDialog } from './user-profile-add-email.dialog';
import { UserProfileContactListRowView } from './user-profile-contact-list-row.view';
import { UserProfileContactRowView } from './user-profile-contact-row.view';
import { useUserProfileEmailRowController } from './user-profile-email-row.controller';

export interface UserProfileEmailRowViewProps {
  emails: UserProfileEmail[];
  username?: string;
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
  username,
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
  const { verification, error, onVerify, onSetPrimary } = useUserProfileEmailRowController({
    emails,
    username,
    onCreateEmail,
    getEmailVerifier,
    onVerifyEmail,
    onSetPrimaryEmail,
  });
  const verificationDialog = useMemo(() => Dialog.createHandle(), []);
  const removeEmailConfirmation = useMemo(() => Confirmation.createHandle<UserProfileEmail>(), []);
  const verifyingId = useRef<string | undefined>(undefined);
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
    verification && onCreateEmail ? (
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

  const dialog = verification ? (
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
        onRemove={onRemoveEmail ? email => removeEmailConfirmation.open(email) : undefined}
        onSetPrimary={onSetPrimary}
        onVerify={
          onVerify
            ? id => {
                verifyingId.current = id;
                onVerify(id);
              }
            : undefined
        }
      >
        <Section.Error>{error}</Section.Error>
      </UserProfileContactListRowView>
      {dialog}
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
