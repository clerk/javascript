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
  isDisabled,
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
  const m = useMessages('userProfileContact');
  const addPhoneAction = canAdd ? (
    <Dialog.Trigger
      handle={verification.handle}
      render={
        <Button
          aria-label={m.phone.add}
          color='neutral'
          size='sm'
          variant='outline'
          disabled={isDisabled}
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
        items={phones}
        kind='phone'
        label={m.phone.label}
        addAction={addPhoneAction}
        onRemove={remove ? phone => remove.open(phone) : undefined}
        onSetPrimary={onSetPrimary}
        onVerify={onVerify}
        isDisabled={isDisabled}
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
          title={m.phone.removeDialog.title}
          description={phone =>
            fill(phone.isVerified ? m.phone.removeDialog.verifiedDescription : m.phone.removeDialog.description, {
              phoneNumber: phone.value,
            })
          }
          actionLabel={m.phone.removeDialog.confirm}
          cancelLabel={m.phone.removeDialog.cancel}
          finalFocus={finalFocus}
        />
      ) : null}
    </Section.Root>
  );
}
