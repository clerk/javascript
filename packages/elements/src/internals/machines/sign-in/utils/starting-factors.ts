// These utilities are ported from: packages/clerk-js/src/ui/components/SignIn/utils.ts
// They should be functionally identical.
import { isWebAuthnSupported } from '@clerk/shared/webauthn';
import type { PreferredSignInStrategy, SignInFactor, SignInFirstFactor, SignInSecondFactor } from '@clerk/types';

const ORDER_WHEN_PASSWORD_PREFERRED = ['passkey', 'password', 'email_link', 'email_code', 'phone_code'] as const;
const ORDER_WHEN_OTP_PREFERRED = ['email_link', 'email_code', 'phone_code', 'passkey', 'password'] as const;
// const ORDER_ALL_STRATEGIES = ['email_link', 'email_code', 'phone_code', 'password'] as const;

const findFactorForIdentifier = (i: string | null) => (f: SignInFactor) => {
  return 'safeIdentifier' in f && f.safeIdentifier === i;
};

// The algorithm can be found at
// https://www.notion.so/clerkdev/Implement-sign-in-alt-methods-e6e60ffb644645b3a0553b50556468ce
export function determineStartingSignInFactor(
  firstFactors: SignInFirstFactor[],
  identifier: string | null,
  preferredSignInStrategy?: PreferredSignInStrategy,
) {
  if (!firstFactors || firstFactors.length === 0) {
    return null;
  }

  return preferredSignInStrategy === 'password'
    ? determineStrategyWhenPasswordIsPreferred(firstFactors, identifier)
    : determineStrategyWhenOTPIsPreferred(firstFactors, identifier);
}

function findPasskeyStrategy(factors: SignInFirstFactor[]) {
  if (isWebAuthnSupported()) {
    const passkeyFactor = factors.find(({ strategy }) => strategy === 'passkey');

    if (passkeyFactor) {
      return passkeyFactor;
    }
  }
  return null;
}

function determineStrategyWhenPasswordIsPreferred(factors: SignInFirstFactor[], identifier: string | null) {
  const passkeyFactor = findPasskeyStrategy(factors);
  if (passkeyFactor) {
    return passkeyFactor;
  }

  // Prefer the password factor if it's available
  const passwordFactor = factors.find(factor => factor.strategy === 'password');
  if (passwordFactor) {
    return passwordFactor;
  }

  // Otherwise, find the factor for the provided identifier, or the next factor based on the preference list
  const factorForIdentifier = factors.find(findFactorForIdentifier(identifier));
  if (factorForIdentifier) {
    return factorForIdentifier;
  }

  for (const preferredFactor of ORDER_WHEN_PASSWORD_PREFERRED) {
    const factor = factors.find(factor => factor.strategy === preferredFactor);
    if (factor) {
      return factor;
    }
  }

  return null;
}

function determineStrategyWhenOTPIsPreferred(factors: SignInFirstFactor[], identifier: string | null) {
  const passkeyFactor = findPasskeyStrategy(factors);
  if (passkeyFactor) {
    return passkeyFactor;
  }

  const factorForIdentifier = factors.find(findFactorForIdentifier(identifier));
  if (factorForIdentifier) {
    return factorForIdentifier;
  }

  // Prefer the password factor if it's available
  const emailLinkFactor = factors.find(factor => factor.strategy === 'email_link');
  if (emailLinkFactor) {
    return emailLinkFactor;
  }

  for (const preferredFactor of ORDER_WHEN_OTP_PREFERRED) {
    const factor = factors.find(factor => factor.strategy === preferredFactor);
    if (factor) {
      return factor;
    }
  }

  return null;
}

// The priority of second factors is: TOTP -> Phone code -> any other factor
export function determineStartingSignInSecondFactor(secondFactors: SignInSecondFactor[]) {
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
