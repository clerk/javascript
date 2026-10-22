import type { UserProfileMfaAddableMethod, UserProfileMfaMethod } from './user-profile-mfa-section.types';

type MfaPhoneInput = {
  id: string;
  phoneNumber: string;
  reservedForSecondFactor: boolean;
  defaultSecondFactor: boolean;
  verification: { status: string | null } | null;
};

type MfaUserInput = {
  phoneNumbers: readonly MfaPhoneInput[];
  totpEnabled: boolean;
  backupCodeEnabled: boolean;
};

export function projectMfa(user: MfaUserInput, policy: { secondFactors: readonly string[]; required: boolean }) {
  const smsEnabled = policy.secondFactors.includes('phone_code');
  const totpEnabled = policy.secondFactors.includes('totp');
  const backupEnabled = policy.secondFactors.includes('backup_code');
  const reservedPhones = user.phoneNumbers.filter(
    phone => phone.reservedForSecondFactor && phone.verification?.status === 'verified',
  );
  const usableCount = Number(totpEnabled && user.totpEnabled) + (smsEnabled ? reservedPhones.length : 0);
  const canRemove = !policy.required || usableCount > 1;
  const authenticatorEnrolled = totpEnabled && user.totpEnabled;
  const methods: UserProfileMfaMethod[] = [];
  if (authenticatorEnrolled) {
    methods.push({ id: 'authenticator', type: 'authenticator', isDefault: true, canRemove });
  }
  for (const phone of smsEnabled
    ? [...reservedPhones].sort((left, right) => Number(right.defaultSecondFactor) - Number(left.defaultSecondFactor))
    : []) {
    methods.push({
      id: phone.id,
      type: 'sms',
      description: phone.phoneNumber,
      isDefault: !authenticatorEnrolled && phone.defaultSecondFactor,
      canRemove,
      canSetDefault: !authenticatorEnrolled && !phone.defaultSecondFactor,
    });
  }
  if (backupEnabled && user.backupCodeEnabled) {
    methods.push({ id: 'backup-codes', type: 'backup-codes' });
  }
  const addableMethods: UserProfileMfaAddableMethod[] = [];
  if (smsEnabled) {
    addableMethods.push('sms');
  }
  if (totpEnabled && !user.totpEnabled) {
    addableMethods.push('authenticator');
  }
  if (backupEnabled && usableCount > 0 && !user.backupCodeEnabled) {
    addableMethods.push('backup-codes');
  }
  return {
    methods,
    addableMethods,
    phones: user.phoneNumbers
      .filter(phone => !phone.reservedForSecondFactor)
      .map(phone => ({
        id: phone.id,
        phoneNumber: phone.phoneNumber,
        verified: phone.verification?.status === 'verified',
      })),
    usableCount,
  };
}
