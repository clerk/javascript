import { stringToFormattedPhoneString } from '@clerk/shared/phone';

import { usePendingAction } from '../../../hooks/use-pending-action';
import type { UserProfilePhone, UserProfilePhoneVerifier } from './user-profile-account-section.types';
import type { UserProfileAddPhoneController } from './user-profile-add-phone.controller';
import { useUserProfileAddPhoneController } from './user-profile-add-phone.controller';

export interface UserProfilePhoneRowControllerOptions {
  phones: UserProfilePhone[];
  onCreatePhone?: (phoneNumber: string) => Promise<UserProfilePhoneVerifier>;
  getPhoneVerifier?: (id: string) => UserProfilePhoneVerifier;
  onVerifyPhone?: (id: string) => void;
  onSetPrimaryPhone?: (id: string) => void | Promise<void>;
}

export interface UserProfilePhoneRowController {
  phones: UserProfilePhone[];
  verification: UserProfileAddPhoneController | undefined;
  error: string | undefined;
  onVerify: ((id: string) => void) | undefined;
  onSetPrimary: ((id: string) => void) | undefined;
}

export function useUserProfilePhoneRowController({
  phones,
  onCreatePhone,
  getPhoneVerifier,
  onVerifyPhone,
  onSetPrimaryPhone,
}: UserProfilePhoneRowControllerOptions): UserProfilePhoneRowController {
  const verification = useUserProfileAddPhoneController({ onCreate: onCreatePhone });
  const setPrimary = usePendingAction();

  const verifyInDialog = (id: string) => {
    const phone = phones.find(phone => phone.id === id);
    const verifier = getPhoneVerifier?.(id);
    if (phone && verifier) {
      verification.onVerifyPhone(phone.value, verifier);
    }
  };

  return {
    phones: phones.map(phone => ({ ...phone, value: stringToFormattedPhoneString(phone.value) })),
    verification: getPhoneVerifier ? verification : undefined,
    error: setPrimary.error,
    onVerify: getPhoneVerifier ? verifyInDialog : onVerifyPhone,
    onSetPrimary: onSetPrimaryPhone ? id => void setPrimary.run(id, () => onSetPrimaryPhone(id)) : undefined,
  };
}
