import { stringToFormattedPhoneString } from '@clerk/shared/phone';
import { useMemo } from 'react';

import { useContactList } from '../use-contact-list';
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
  const formattedPhones = useMemo(
    () => phones.map(phone => ({ ...phone, value: stringToFormattedPhoneString(phone.value) })),
    [phones],
  );
  const list = useContactList({ items: formattedPhones, onSetPrimary: onSetPrimaryPhone });

  return {
    phones: list.items,
    defaultPhoneCountry,
    canAdd: Boolean(onCreatePhone),
    verification,
    error: list.error,
    pendingId: list.pendingId,
    shownPendingId: list.shownPendingId,
    onVerify: id => {
      const phone = phones.find(phone => phone.id === id);
      if (phone) {
        verification.onVerifyPhone(phone.value, getPhoneVerifier(id));
      }
    },
    onSetPrimary: list.setPrimary,
    onRemove: onRemovePhone,
  };
}
