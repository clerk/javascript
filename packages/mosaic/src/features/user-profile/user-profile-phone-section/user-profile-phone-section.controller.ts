import { stringToFormattedPhoneString } from '@clerk/shared/phone';

import { usePendingAction } from '../../../hooks/use-pending-action';
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

  return {
    phones: phones.map(phone => ({ ...phone, value: stringToFormattedPhoneString(phone.value) })),
    defaultPhoneCountry,
    canAdd: Boolean(onCreatePhone),
    verification,
    error: setPrimary.error,
    onVerify: id => {
      const phone = phones.find(phone => phone.id === id);
      if (phone) {
        verification.onVerifyPhone(phone.value, getPhoneVerifier(id));
      }
    },
    onSetPrimary: id => void setPrimary.run(id, () => onSetPrimaryPhone(id)),
    onRemove: onRemovePhone,
  };
}
