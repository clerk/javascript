import { stringToFormattedPhoneString } from '@clerk/shared/phone';
import { useRef } from 'react';

import { useConfirmController } from '../../../blocks/confirm';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { usePendingAction } from '../../../hooks/use-pending-action';
import type { UserProfilePhone } from '../user-profile-contact.types';
import { useUserProfileAddPhoneController } from './user-profile-add-phone.controller';
import type { ReadyPhoneSectionModel, UserProfilePhoneSectionViewProps } from './user-profile-phone-section.types';

export function useUserProfilePhoneSectionController({
  phones,
  defaultPhoneCountry,
  onCreatePhone,
  getPhoneVerifier,
  onSetPrimaryPhone,
  onRemovePhone,
}: Omit<ReadyPhoneSectionModel, 'status' | 'userId'>): UserProfilePhoneSectionViewProps {
  const verification = useUserProfileAddPhoneController({ onCreate: onCreatePhone });
  const setPrimary = usePendingAction();
  const rowRef = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: phones.map(phone => phone.id),
    onRemove: onRemovePhone,
    fallback: () => rowRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? rowRef.current,
  });
  const remove = useConfirmController<UserProfilePhone>({ onConfirm: phone => removalFocus.remove(phone.id) });

  return {
    phones: phones.map(phone => ({ ...phone, value: stringToFormattedPhoneString(phone.value) })),
    defaultPhoneCountry,
    canAdd: Boolean(onCreatePhone),
    verification,
    error: setPrimary.error,
    rowRef,
    registerTrigger: removalFocus.registerTrigger,
    remove: onRemovePhone ? remove : undefined,
    finalFocus: removalFocus.finalFocus,
    verificationFinalFocus: () => (verification.verifyingId ? removalFocus.trigger(verification.verifyingId) : null),
    onVerify: id => {
      const phone = phones.find(phone => phone.id === id);
      if (phone) {
        verification.onVerifyPhone(phone, getPhoneVerifier(id));
      }
    },
    onSetPrimary: id => void setPrimary.run(id, () => onSetPrimaryPhone(id)),
  };
}
