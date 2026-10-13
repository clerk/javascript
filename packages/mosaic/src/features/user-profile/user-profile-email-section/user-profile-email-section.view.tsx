import { useMemo, useRef } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { fill, useMessages } from '../../../localization';
import type { UserProfileEmail } from '../user-profile-contact.types';
import { UserProfileContactListRowView } from '../user-profile-contact-list-row.view';
import { UserProfileAddEmailDialog } from './user-profile-add-email.dialog';
import type { UserProfileEmailSectionViewProps } from './user-profile-email-section.types';

export function UserProfileEmailSectionView({
  emails,
  canAdd,
  verification,
  error,
  onVerify,
  onSetPrimary,
  onRemove,
}: UserProfileEmailSectionViewProps) {
  const m = useMessages('userProfileContact');
  const row = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: emails.map(email => email.id),
    onRemove,
    fallback: () => row.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? row.current,
  });
  const verificationDialog = useMemo(() => Dialog.createHandle(), []);
  const removeEmailConfirmation = useMemo(() => Confirmation.createHandle<UserProfileEmail>(), []);
  const verifyingId = useRef<string | undefined>(undefined);
  const addEmailAction = canAdd ? (
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
      <Icon
        name='plus'
        placement='inline-start'
        size='sm'
      />
      {m.add}
    </Dialog.Trigger>
  ) : undefined;

  return (
    <Section.Root>
      <UserProfileContactListRowView
        rowRef={row}
        triggerRef={removalFocus.registerTrigger}
        items={emails}
        kind='email'
        label={m.email.label}
        addAction={addEmailAction}
        onRemove={onRemove ? email => removeEmailConfirmation.open(email) : undefined}
        onSetPrimary={onSetPrimary}
        onVerify={id => {
          verifyingId.current = id;
          onVerify(id);
        }}
      >
        <Section.Error>{error}</Section.Error>
      </UserProfileContactListRowView>
      <UserProfileAddEmailDialog
        {...verification}
        handle={verificationDialog}
        finalFocus={() => {
          const id = verifyingId.current;
          verifyingId.current = undefined;
          return id ? removalFocus.trigger(id) : null;
        }}
      />
      {onRemove ? (
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
    </Section.Root>
  );
}
