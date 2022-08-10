import { Attributes, EnvironmentResource, PhoneNumberResource, UserResource } from '@clerk/types';

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
  return [
    ...(attributes.phone_number.used_for_second_factor ? attributes.phone_number.second_factors : []),
    ...(attributes.authenticator_app.used_for_second_factor ? attributes.authenticator_app.second_factors : []),
  ];
}

export function getSecondFactorsAvailableToAdd(attributes: Attributes, user: UserResource): string[] {
  let sfs = getSecondFactors(attributes);

  // If user.totp_enabled, skip totp from the list of choices
  if (user.totpEnabled) {
    sfs = sfs.filter(f => f !== 'totp');
  }

  return sfs;
}
