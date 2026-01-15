import type { Attributes, PhoneNumberResource, UserResource } from '@clerk/shared/types';

export const defaultFirst = (a: PhoneNumberResource) => (a.defaultSecondFactor ? -1 : 1);

export function getSecondFactors(attributes: Partial<Attributes>): string[] {
  const secondFactors: string[] = [];

  Object.entries(attributes).forEach(([, attr]) => {
    if (attr.used_for_second_factor) {
      secondFactors.push(...attr.second_factors);
    }
  });

  return secondFactors;
}

export function getSecondFactorsAvailableToAdd(attributes: Partial<Attributes>, user: UserResource): string[] {
  let sfs = getSecondFactors(attributes);

  if (user.totpEnabled) {
    sfs = sfs.filter(f => f !== 'totp');
  }

  if (user.backupCodeEnabled || !user.twoFactorEnabled) {
    sfs = sfs.filter(f => f !== 'backup_code');
  }

  return sfs;
}
