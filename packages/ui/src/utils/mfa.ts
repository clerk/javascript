import type { Attributes, PhoneNumberResource, UserResource, VerificationStrategy } from '@clerk/shared/types';

export const defaultFirst = (a: PhoneNumberResource) => (a.defaultSecondFactor ? -1 : 1);

export function getSecondFactors(attributes: Partial<Attributes>): VerificationStrategy[] {
  const secondFactors: VerificationStrategy[] = [];

  Object.entries(attributes).forEach(([, attr]) => {
    if (attr?.used_for_second_factor && attr.second_factors) {
      secondFactors.push(...attr.second_factors);
    }
  });

  return secondFactors;
}

export function getSecondFactorsAvailableToAdd(
  attributes: Partial<Attributes>,
  user: UserResource,
): VerificationStrategy[] {
  let sfs = getSecondFactors(attributes);

  if (user.totpEnabled) {
    sfs = sfs.filter(f => f !== 'totp');
  }

  if (user.backupCodeEnabled || !user.twoFactorEnabled) {
    sfs = sfs.filter(f => f !== 'backup_code');
  }

  return sfs;
}
