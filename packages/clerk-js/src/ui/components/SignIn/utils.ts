import { titleize } from '@clerk/shared/underscore';
import { isWebAuthnSupported } from '@clerk/shared/webauthn';
import type { PreferredSignInStrategy, SignInFactor, SignInResource, SignInStrategy } from '@clerk/types';
import type { FormControlState } from 'ui/utils';

import { PREFERRED_SIGN_IN_STRATEGIES } from '../../common/constants';
import { otpPrefFactorComparator, passwordPrefFactorComparator } from '../../utils/factorSorting';

const factorForIdentifier = (i: string | null) => (f: SignInFactor) => {
  return 'safeIdentifier' in f && f.safeIdentifier === i;
};

function findPasskeyStrategy(factors: SignInFactor[]): SignInFactor | null {
  if (isWebAuthnSupported()) {
    // @ts-ignore
    const passkeyFactor = factors.find(({ strategy }) => strategy === 'passkey');

    if (passkeyFactor) {
      return passkeyFactor;
    }
  }
  return null;
}

function determineStrategyWhenPasswordIsPreferred(
  factors: SignInFactor[],
  identifier: string | null,
): SignInFactor | null {
  const passkeyFactor = findPasskeyStrategy(factors);
  if (passkeyFactor) {
    return passkeyFactor;
  }
  const selected = factors.sort(passwordPrefFactorComparator)[0];
  if (selected.strategy === 'password') {
    return selected;
  }
  return factors.find(factorForIdentifier(identifier)) || selected || null;
}

function determineStrategyWhenOTPIsPreferred(factors: SignInFactor[], identifier: string | null): SignInFactor | null {
  const passkeyFactor = findPasskeyStrategy(factors);
  if (passkeyFactor) {
    return passkeyFactor;
  }
  const sortedBasedOnPrefFactor = factors.sort(otpPrefFactorComparator);
  const forIdentifier = sortedBasedOnPrefFactor.find(factorForIdentifier(identifier));
  if (forIdentifier) {
    return forIdentifier;
  }
  const firstBasedOnPref = sortedBasedOnPrefFactor[0];
  if (firstBasedOnPref.strategy === 'email_link') {
    return firstBasedOnPref;
  }
  return factors.find(factorForIdentifier(identifier)) || firstBasedOnPref || null;
}

// The algorithm can be found at
// https://www.notion.so/clerkdev/Implement-sign-in-alt-methods-e6e60ffb644645b3a0553b50556468ce
export function determineStartingSignInFactor(
  firstFactors: SignInFactor[] | null,
  identifier: string | null,
  preferredSignInStrategy: PreferredSignInStrategy,
): SignInFactor | null | undefined {
  if (!firstFactors || firstFactors.length === 0) {
    return null;
  }

  return preferredSignInStrategy === PREFERRED_SIGN_IN_STRATEGIES.Password
    ? determineStrategyWhenPasswordIsPreferred(firstFactors, identifier)
    : determineStrategyWhenOTPIsPreferred(firstFactors, identifier);
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

// The priority of second factors is: TOTP -> Phone code -> any other factor
export function determineStartingSignInSecondFactor(secondFactors: SignInFactor[] | null): SignInFactor | null {
  if (!secondFactors || secondFactors.length === 0) {
    return null;
  }

  const totpFactor = secondFactors.find(f => f.strategy === 'totp');
  if (totpFactor) {
    return totpFactor;
  }

  const phoneCodeFactor = secondFactors.find(f => f.strategy === 'phone_code');
  if (phoneCodeFactor) {
    return phoneCodeFactor;
  }

  return secondFactors[0];
}

const resetPasswordStrategies: SignInStrategy[] = ['reset_password_phone_code', 'reset_password_email_code'];
export const isResetPasswordStrategy = (strategy: SignInStrategy | string | null | undefined) =>
  !!strategy && resetPasswordStrategies.includes(strategy as SignInStrategy);

const isEmail = (str: string) => /^\S+@\S+\.\S+$/.test(str);
export function getSignUpAttributeFromIdentifier(identifier: FormControlState<'identifier'>) {
  if (identifier.type === 'tel') {
    return 'phoneNumber';
  }

  if (isEmail(identifier.value)) {
    return 'emailAddress';
  }

  return 'username';
}
