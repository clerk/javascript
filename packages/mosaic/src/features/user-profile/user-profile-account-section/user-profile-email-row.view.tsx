import { useMemo } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { fill, useMessages } from '../../../localization';
import { useContactList } from './use-contact-list';
import type { UserProfileEmail } from './user-profile-account-section.types';
import type { UserProfileAddEmailControllerOptions } from './user-profile-add-email.controller';
import { useUserProfileAddEmailController } from './user-profile-add-email.controller';
import { UserProfileAddEmailDialog } from './user-profile-add-email.dialog';
import { UserProfileContactListRowView } from './user-profile-contact-list-row.view';
import { UserProfileContactRowView } from './user-profile-contact-row.view';

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
  const m = useMessages('userProfileAccountSection');
  const list = useContactList({
    items: emails,
    onSetPrimary: onSetPrimaryEmail,
    primaryErrorMessage: m.email.primaryError,
  });
  const removalFocus = useListRemovalFocus({
    ids: list.shownItems.map(email => email.id),
    onRemove: onRemoveEmail,
    fallback: list.removalFallback,
  });
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
  const removeEmailConfirmation = useMemo(() => Confirmation.createHandle<UserProfileEmail>(), []);
  const removeEmail = (id: string) => {
    const email = emails.find(email => email.id === id);
    if (email && email.canRemove !== false && onRemoveEmail) {
      removeEmailConfirmation.open(email);
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
        rowRef={list.row}
        triggerRef={removalFocus.registerTrigger}
        items={list.shownItems}
        kind='email'
        label={m.email.label}
        addAction={addEmailAction}
        onRemove={onRemoveEmail ? removeEmail : undefined}
        onSetPrimary={list.setPrimary}
        pendingId={list.pendingPrimaryId}
        shownPendingId={list.shownPendingId}
        onVerify={onVerifyEmail}
      >
        <Section.Error>{list.primaryError}</Section.Error>
      </UserProfileContactListRowView>
      {onRemoveEmail ? (
        <Confirmation
          handle={removeEmailConfirmation}
          title={m.email.removeDialog.title}
          description={email => fill(m.email.removeDialog.description, { emailAddress: email.value })}
          actionLabel={m.email.removeDialog.confirm}
          cancelLabel={m.email.removeDialog.cancel}
          finalFocus={removalFocus.finalFocus}
          onConfirm={email => removalFocus.remove(email.id)}
        />
      ) : null}
    </>
  );
}

function AddEmail({ options, compact }: { options: UserProfileAddEmailControllerOptions; compact: boolean }) {
  const m = useMessages('userProfileAccountSection');
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
