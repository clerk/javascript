import { useMemo, useRef } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Text } from '../../../components/text';
import { useListRemovalFocus } from '../../../hooks/useListRemovalFocus';
import { fill, useMessages } from '../../../localization';
import type { UserProfileEmail } from './user-profile-account-section.types';
import type { UserProfileAddEmailControllerOptions } from './user-profile-add-email.controller';
import { useUserProfileAddEmailController } from './user-profile-add-email.controller';
import { UserProfileAddEmailDialog } from './user-profile-add-email.dialog';
import { UserProfileContactListRowView } from './user-profile-contact-list-row.view';
import { UserProfileContactRowView } from './user-profile-contact-row.view';
import { useUserProfileSetPrimaryController } from './user-profile-set-primary.controller';

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
  const row = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: emails.map(email => email.id),
    onRemove: onRemoveEmail,
    fallback: () => row.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? row.current,
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
        rowRef={row}
        triggerRef={removalFocus.registerTrigger}
        items={emails}
        kind='email'
        label={m.email.label}
        addAction={addEmailAction}
        onRemove={onRemoveEmail ? removeEmail : undefined}
        onSetPrimary={primary.onSetPrimary}
        onVerify={onVerifyEmail}
      />
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
