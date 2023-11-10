import type { Attributes, EnvironmentResource, PhoneNumberResource, UserResource } from '@clerk/types';

type IDable = { id: string };

export const primaryIdentificationFirst = (primaryId: string | null) => (val1: IDable, val2: IDable) => {
  return primaryId === val1.id ? -1 : primaryId === val2.id ? 1 : 0;
};

export const currentSessionFirst = (id: string) => (a: IDable) => a.id === id ? -1 : 1;

export const defaultFirst = (a: PhoneNumberResource) => (a.defaultSecondFactor ? -1 : 1);

export function magicLinksEnabledForInstance(env: EnvironmentResource): boolean {
  const { userSettings } = env;
  const { email_address } = userSettings.attributes;
  return email_address.enabled && email_address.verifications.includes('email_link');
}

export function getSecondFactors(attributes: Attributes): string[] {
  const secondFactors: string[] = [];

  Object.entries(attributes).forEach(([, attr]) => {
    attr.used_for_second_factor ? secondFactors.push(...attr.second_factors) : null;
  });

  return secondFactors;
}

export function getSecondFactorsAvailableToAdd(attributes: Attributes, user: UserResource): string[] {
  let sfs = getSecondFactors(attributes);

  // If user.totp_enabled, skip totp from the list of choices
  if (user.totpEnabled) {
    sfs = sfs.filter(f => f !== 'totp');
  }

  // Remove backup codes if already enabled or user doesn't have another MFA method added
  if (user.backupCodeEnabled || !user.twoFactorEnabled) {
    sfs = sfs.filter(f => f !== 'backup_code');
  }

  return sfs;
}
