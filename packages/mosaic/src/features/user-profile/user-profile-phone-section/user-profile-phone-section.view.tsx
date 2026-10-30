import { Confirmation } from '../../../blocks/confirmation';
import { ReverificationDialog } from '../../../blocks/reverification';
import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { Plus } from '../../../icons/glyphs/plus';
import { fill, useMessages } from '../../../localization';
import { UserProfileContactListRowView } from '../user-profile-contact-list-row.view';
import { UserProfileAddPhoneDialog } from './user-profile-add-phone.dialog';
import type { UserProfilePhoneSectionViewProps } from './user-profile-phone-section.types';

export function UserProfilePhoneSectionView({
  phones,
  defaultPhoneCountry,
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
}: UserProfilePhoneSectionViewProps) {
  const messages = useMessages('userProfile');
  const m = messages.phone;
  const addPhoneAction = canAdd ? (
    <Dialog.Trigger
      handle={verification.handle}
      render={
        <Button
          aria-label={m.add}
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
      {messages.contact.add}
    </Dialog.Trigger>
  ) : undefined;

  return (
    <Section.Root search={{ label: m.phone.label }}>
      <UserProfileContactListRowView
        rowRef={rowRef}
        triggerRef={registerTrigger}
        items={phones}
        kind='phone'
        label={m.label}
        addAction={addPhoneAction}
        onRemove={remove ? phone => remove.open(phone) : undefined}
        onSetPrimary={onSetPrimary}
        onVerify={onVerify}
        pendingVerifyId={verification.pendingVerifyId}
      >
        <Section.Error>{error}</Section.Error>
      </UserProfileContactListRowView>
      <UserProfileAddPhoneDialog
        {...verification}
        defaultCountry={defaultPhoneCountry}
        finalFocus={verificationFinalFocus}
      />
      <ReverificationDialog
        controller={setPrimaryReverification}
        finalFocus={setPrimaryFinalFocus}
      />
      {remove ? (
        <Confirmation
          controller={remove}
          title={m.removeDialog.title}
          description={phone =>
            fill(phone.isVerified ? m.removeDialog.verifiedDescription : m.removeDialog.description, {
              phoneNumber: phone.value,
            })
          }
          actionLabel={m.removeDialog.confirm}
          cancelLabel={m.removeDialog.cancel}
          finalFocus={finalFocus}
        />
      ) : null}
    </Section.Root>
  );
}
