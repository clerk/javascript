// These utilities are ported from: packages/clerk-js/src/ui/components/SignIn/utils.ts
// They should be functionally identical.
import type {
  PreferredSignInStrategy,
  SignInFactor,
  SignInFirstFactor,
  SignInSecondFactor,
  SignInStrategy,
} from '@clerk/shared/types';
import { isWebAuthnSupported } from '@clerk/shared/webauthn';

// Factor sorting - https://github.com/clerk/javascript/blob/5764e2911790051589bb5c4f3b1a2c79f7f30c7e/packages/clerk-js/src/ui/utils/factorSorting.ts
const makeSortingOrderMap = <T extends string>(arr: T[]): Record<T, number> =>
  arr.reduce(
    (acc, k, i) => {
      acc[k] = i;
      return acc;
    },
    {} as Record<T, number>,
  );

const STRATEGY_SORT_ORDER_PASSWORD_PREF = makeSortingOrderMap([
  'passkey',
  'password',
  'email_link',
  'email_code',
  'phone_code',
] as SignInStrategy[]);

const STRATEGY_SORT_ORDER_OTP_PREF = makeSortingOrderMap([
  'email_code',
  'email_link',
  'phone_code',
  'passkey',
  'password',
] as SignInStrategy[]);

const makeSortingFunction =
  (sortingMap: Record<SignInStrategy, number>) =>
  (a: SignInFactor, b: SignInFactor): number => {
    const orderA = sortingMap[a.strategy];
    const orderB = sortingMap[b.strategy];
    if (orderA === undefined || orderB === undefined) {
      return 0;
    }
    return orderA - orderB;
  };

const passwordPrefFactorComparator = makeSortingFunction(STRATEGY_SORT_ORDER_PASSWORD_PREF);
const otpPrefFactorComparator = makeSortingFunction(STRATEGY_SORT_ORDER_OTP_PREF);

const findFactorForIdentifier = (i: string | null) => (f: SignInFactor) => {
  return 'safeIdentifier' in f && f.safeIdentifier === i;
};

// The algorithm can be found at
// https://www.notion.so/clerkdev/Implement-sign-in-alt-methods-e6e60ffb644645b3a0553b50556468ce
export function determineStartingSignInFactor(
  firstFactors: SignInFirstFactor[] | null,
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
  const selected = factors.sort(passwordPrefFactorComparator)[0];
  if (selected.strategy === 'password') {
    return selected;
  }
  return factors.find(findFactorForIdentifier(identifier)) || selected || null;
}

function determineStrategyWhenOTPIsPreferred(factors: SignInFirstFactor[], identifier: string | null) {
  const passkeyFactor = findPasskeyStrategy(factors);
  if (passkeyFactor) {
    return passkeyFactor;
  }

  const sortedBasedOnPrefFactor = factors.sort(otpPrefFactorComparator);
  const forIdentifier = sortedBasedOnPrefFactor.find(findFactorForIdentifier(identifier));
  if (forIdentifier) {
    return forIdentifier;
  }
  const firstBasedOnPref = sortedBasedOnPrefFactor[0];
  if (firstBasedOnPref.strategy === 'email_link') {
    return firstBasedOnPref;
  }
  return factors.find(findFactorForIdentifier(identifier)) || firstBasedOnPref || null;
}

// The priority of second factors is: TOTP -> Phone code -> any other factor
export function determineStartingSignInSecondFactor(secondFactors: SignInSecondFactor[] | null) {
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
