import { useMemo } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
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
  onVerify,
  onSetPrimary,
}: UserProfilePhoneSectionViewProps) {
  const m = useMessages('userProfileContact');
  const verificationDialog = useMemo(() => Dialog.createHandle(), []);
  const addPhoneAction = canAdd ? (
    <Dialog.Trigger
      handle={verificationDialog}
      render={
        <Button
          aria-label={m.phone.add}
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
        rowRef={rowRef}
        triggerRef={registerTrigger}
        items={phones}
        kind='phone'
        label={m.phone.label}
        addAction={addPhoneAction}
        onRemove={remove ? phone => remove.open(phone) : undefined}
        onSetPrimary={onSetPrimary}
        onVerify={onVerify}
      >
        <Section.Error>{error}</Section.Error>
      </UserProfileContactListRowView>
      <UserProfileAddPhoneDialog
        {...verification}
        defaultCountry={defaultPhoneCountry}
        handle={verificationDialog}
        finalFocus={verificationFinalFocus}
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
