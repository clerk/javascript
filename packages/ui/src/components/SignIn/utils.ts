import type { PhoneCodeChannel, SignInFactor, SignInResource, SignInStrategy } from '@clerk/shared/types';
import { titleize } from '@clerk/shared/underscore';

import { isEmail } from '@/ui/utils/emailUtils';
import { getPreferredPhoneCodeChannelByCountry } from '@/ui/utils/phoneUtils';
import type { FormControlState } from '@/ui/utils/useFormControl';

export function isOfferableSecondFactor(factor: { strategy: SignInStrategy }, webAuthnSupported: boolean): boolean {
  return factor.strategy !== 'passkey' || webAuthnSupported;
}

function findPasskeyStrategy(factors: SignInFactor[], webAuthnSupported: boolean): SignInFactor | null {
  if (webAuthnSupported) {
    // @ts-ignore
    const passkeyFactor = factors.find(({ strategy }) => strategy === 'passkey');

    if (passkeyFactor) {
      return passkeyFactor;
    }
  }
  return null;
}

export function determineSalutation(signIn: Partial<SignInResource>): string {
  if (!signIn) {
    return '';
  }

  return titleize(signIn.userData?.firstName) || titleize(signIn.userData?.lastName) || signIn?.identifier || '';
}

const localStrategies: SignInStrategy[] = ['passkey', 'email_code', 'password', 'phone_code', 'email_link'];

export function factorHasLocalStrategy(factor: SignInFactor | undefined | null): boolean {
  if (!factor) {
    return false;
  }
  return localStrategies.includes(factor.strategy);
}

// The priority of second factors is: Passkey -> TOTP -> Phone code -> any other factor.
// Passkey is only offered where WebAuthn is supported — without it the passkey
// card is a dead end, so fall through to the enrolled code-based factors instead.
export function determineStartingSignInSecondFactor(
  secondFactors: SignInFactor[] | null,
  webAuthnSupported: boolean,
): SignInFactor | null {
  if (!secondFactors || secondFactors.length === 0) {
    return null;
  }

  const passkeyFactor = findPasskeyStrategy(secondFactors, webAuthnSupported);
  if (passkeyFactor) {
    return passkeyFactor;
  }

  const totpFactor = secondFactors.find(f => f.strategy === 'totp');
  if (totpFactor) {
    return totpFactor;
  }

  const phoneCodeFactor = secondFactors.find(f => f.strategy === 'phone_code');
  if (phoneCodeFactor) {
    return phoneCodeFactor;
  }

  return secondFactors.find(f => f.strategy !== 'passkey') ?? secondFactors[0];
}

const resetPasswordStrategies: SignInStrategy[] = ['reset_password_phone_code', 'reset_password_email_code'];
export const isResetPasswordStrategy = (strategy: SignInStrategy | string | null | undefined) =>
  !!strategy && resetPasswordStrategies.includes(strategy as SignInStrategy);

/** Whether the sign-in's first factor was a verified password reset. */
export const isResettingPassword = (resource: SignInResource) =>
  isResetPasswordStrategy(resource.firstFactorVerification?.strategy) &&
  resource.firstFactorVerification?.status === 'verified';

export function getSignUpAttributeFromIdentifier(identifier: FormControlState<'identifier'>) {
  if (identifier.type === 'tel') {
    return 'phoneNumber';
  }

  if (isEmail(identifier.value)) {
    return 'emailAddress';
  }

  return 'username';
}

export const getPreferredAlternativePhoneChannel = (
  fields: Array<FormControlState<string>>,
  preferredChannels: Record<string, PhoneCodeChannel> | null,
  phoneNumberFieldName: 'identifier' | 'phoneNumber',
): PhoneCodeChannel | null => {
  // If preferred channels are not set, we don't expect to have a preferred phone code provider
  if (!preferredChannels) {
    return null;
  }
  const strategy = fields.find(f => f.id === 'strategy')?.value;
  // If the strategy is missing, it could be implied from the identifier being a phone number
  if (!!strategy && strategy !== 'phone_code') {
    return null;
  }
  const phoneNumber = fields.find(f => f.id === phoneNumberFieldName)?.value;
  // If identifier is missing or if it does not start with '+' (meaning that it's not a phone number), then it's not a phone_code strategy
  if (!phoneNumber || !phoneNumber?.startsWith('+')) {
    return null;
  }
  const preferredChannel: PhoneCodeChannel | null = getPreferredPhoneCodeChannelByCountry(
    phoneNumber,
    preferredChannels,
  );
  // If the preferred channel is sms, we don't expect to have a preferred phone code provider
  if (preferredChannel === 'sms') {
    return null;
  }
  return preferredChannel;
};

// This function is almost identical to getPreferredAlternativePhoneChannel, but it's used in the combined flow
// where we don't have access to the form fields.
export const getPreferredAlternativePhoneChannelForCombinedFlow = (
  preferredChannels: Record<string, PhoneCodeChannel> | null,
  identifierAttribute: 'phoneNumber' | 'emailAddress' | 'username',
  identifierValue: string,
): PhoneCodeChannel | null => {
  if (!preferredChannels) {
    return null;
  }
  if (!identifierAttribute || identifierAttribute !== 'phoneNumber') {
    return null;
  }
  if (!identifierValue || !identifierValue?.startsWith('+')) {
    return null;
  }
  const preferredChannel: PhoneCodeChannel | null = getPreferredPhoneCodeChannelByCountry(
    identifierValue,
    preferredChannels,
  );
  if (preferredChannel === 'sms') {
    return null;
  }
  return preferredChannel;
};
