import { Confirmation } from '../../../blocks/confirmation';
import { ReverificationDialog } from '../../../blocks/reverification';
import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { Plus } from '../../../icons/glyphs/plus';
import { fill, useMessages } from '../../../localization';
import { UserProfileContactListRowView } from '../user-profile-contact-list-row.view';
import { UserProfileAddEmailDialog } from './user-profile-add-email.dialog';
import type { UserProfileEmailSectionViewProps } from './user-profile-email-section.types';

export function UserProfileEmailSectionView({
  emails,
  canAdd,
  verification,
  error,
  rowRef,
  registerTrigger,
  remove,
  finalFocus,
  verificationFinalFocus,
  setPrimaryReverification,
  setPrimaryFinalFocus,
  onVerify,
  onSetPrimary,
}: UserProfileEmailSectionViewProps) {
  const m = useMessages('userProfileContact');
  const addEmailAction = canAdd ? (
    <Dialog.Trigger
      handle={verification.handle}
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
        glyph={Plus}
        placement='inline-start'
        size='sm'
      />
      {m.add}
    </Dialog.Trigger>
  ) : undefined;

  return (
    <Section.Root>
      <UserProfileContactListRowView
        rowRef={rowRef}
        triggerRef={registerTrigger}
        items={emails}
        kind='email'
        label={m.email.label}
        addAction={addEmailAction}
        onRemove={remove ? email => remove.open(email) : undefined}
        onSetPrimary={onSetPrimary}
        onVerify={onVerify}
      >
        <Section.Error>{error}</Section.Error>
      </UserProfileContactListRowView>
      <UserProfileAddEmailDialog
        {...verification}
        finalFocus={verificationFinalFocus}
      />
      <ReverificationDialog
        controller={setPrimaryReverification}
        finalFocus={setPrimaryFinalFocus}
      />
      {remove ? (
        <Confirmation
          controller={remove}
          title={m.email.removeDialog.title}
          description={email =>
            fill(email.isVerified ? m.email.removeDialog.verifiedDescription : m.email.removeDialog.description, {
              emailAddress: email.value,
            })
          }
          actionLabel={m.email.removeDialog.confirm}
          cancelLabel={m.email.removeDialog.cancel}
          finalFocus={finalFocus}
        />
      ) : null}
    </Section.Root>
  );
}
