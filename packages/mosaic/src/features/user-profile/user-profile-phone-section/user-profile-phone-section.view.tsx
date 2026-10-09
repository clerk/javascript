import { useMemo, useRef } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { fill, useMessages } from '../../../localization';
import type { UserProfilePhone } from '../user-profile-contact.types';
import { UserProfileContactListRowView } from '../user-profile-contact-list-row.view';
import { UserProfileAddPhoneDialog } from './user-profile-add-phone.dialog';
import type { UserProfilePhoneSectionViewProps } from './user-profile-phone-section.types';

export function UserProfilePhoneSectionView({
  phones,
  defaultPhoneCountry,
  canAdd,
  verification,
  error,
  onVerify,
  onSetPrimary,
  onRemove,
}: UserProfilePhoneSectionViewProps) {
  const m = useMessages('userProfileContact');
  const row = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: phones.map(phone => phone.id),
    onRemove,
    fallback: () => row.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? row.current,
  });
  const verificationDialog = useMemo(() => Dialog.createHandle(), []);
  const removePhoneConfirmation = useMemo(() => Confirmation.createHandle<UserProfilePhone>(), []);
  const verifyingId = useRef<string | undefined>(undefined);
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
        rowRef={row}
        triggerRef={removalFocus.registerTrigger}
        items={phones}
        kind='phone'
        label={m.phone.label}
        addAction={addPhoneAction}
        onRemove={onRemove ? phone => removePhoneConfirmation.open(phone) : undefined}
        onSetPrimary={onSetPrimary}
        onVerify={id => {
          verifyingId.current = id;
          onVerify(id);
        }}
      >
        <Section.Error>{error}</Section.Error>
      </UserProfileContactListRowView>
      <UserProfileAddPhoneDialog
        {...verification}
        defaultCountry={defaultPhoneCountry}
        handle={verificationDialog}
        finalFocus={() => {
          const id = verifyingId.current;
          verifyingId.current = undefined;
          return id ? removalFocus.trigger(id) : null;
        }}
      />
      {onRemove ? (
        <Confirmation
          handle={removePhoneConfirmation}
          title={m.phone.removeDialog.title}
          description={phone =>
            fill(phone.isVerified ? m.phone.removeDialog.verifiedDescription : m.phone.removeDialog.description, {
              phoneNumber: phone.value,
            })
          }
          actionLabel={m.phone.removeDialog.confirm}
          cancelLabel={m.phone.removeDialog.cancel}
          finalFocus={removalFocus.finalFocus}
          onConfirm={phone => removalFocus.remove(phone.id)}
        />
      ) : null}
    </Section.Root>
  );
}
