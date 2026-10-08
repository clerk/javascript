import { useReverification, useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/shared/types';

import { useEnvironment } from '@/ui/contexts';
import { defaultFirst, getSecondFactors, getSecondFactorsAvailableToAdd } from '@/ui/utils/mfa';

export const useMfaSectionModel = () => {
  const {
    userSettings: { attributes, signUp },
  } = useEnvironment();
  const { user } = useUser();

  if (!user) {
    return {
      hasUser: false,
      showTOTP: false,
      showBackupCode: false,
      showPhoneCode: false,
      phones: [] as PhoneNumberResource[],
      secondFactorsAvailableToAdd: [] as string[],
      hideTOTPDeleteAction: false,
      hidePhoneCodeDeleteAction: false,
    };
  }

  const secondFactors = getSecondFactors(attributes);
  const secondFactorsAvailableToAdd = getSecondFactorsAvailableToAdd(attributes, user);
  const showTOTP = secondFactors.includes('totp') && user.totpEnabled;
  const showBackupCode = secondFactors.includes('backup_code') && user.backupCodeEnabled;
  const showPhoneCode = secondFactors.includes('phone_code');

  const phones = user.phoneNumbers
    .filter(phone => phone.verification.status === 'verified')
    .filter(phone => phone.reservedForSecondFactor)
    .sort(defaultFirst);

  return {
    hasUser: true,
    showTOTP,
    showBackupCode,
    showPhoneCode,
    phones,
    secondFactorsAvailableToAdd,
    hideTOTPDeleteAction: Boolean(signUp.mfa?.required && phones.length === 0),
    hidePhoneCodeDeleteAction: Boolean(signUp.mfa?.required && !showTOTP && phones.length === 1),
  };
};

export const useMfaPhoneCodeModel = (
  phone: PhoneNumberResource,
  showTOTP: boolean,
  hidePhoneCodeDeleteAction: boolean,
) => {
  const makeDefaultSecondFactor = useReverification(() => phone.makeDefaultSecondFactor());

  return {
    id: phone.id,
    phoneNumber: phone.phoneNumber,
    isDefault: !showTOTP && phone.defaultSecondFactor,
    showSetDefaultAction: !showTOTP && !phone.defaultSecondFactor,
    hidePhoneCodeDeleteAction,
    makeDefaultSecondFactor,
  };
};
