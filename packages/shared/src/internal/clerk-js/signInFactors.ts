import type { PreferredSignInStrategy, SignInFactor, SignInStrategy } from '../../types';

/**
 * Picks the first factor a sign-in starts on, following the algorithm at
 * https://www.notion.so/clerkdev/Implement-sign-in-alt-methods-e6e60ffb644645b3a0553b50556468ce
 *
 * @internal
 */
export function determineStartingSignInFactor(
  firstFactors: SignInFactor[] | null,
  identifier: string | null,
  preferredSignInStrategy: PreferredSignInStrategy,
  webAuthnSupported: boolean,
): SignInFactor | null | undefined {
  if (!firstFactors || firstFactors.length === 0) {
    return null;
  }

  return preferredSignInStrategy === 'password'
    ? determineStrategyWhenPasswordIsPreferred(firstFactors, identifier, webAuthnSupported)
    : determineStrategyWhenOTPIsPreferred(firstFactors, identifier, webAuthnSupported);
}

function determineStrategyWhenPasswordIsPreferred(
  factors: SignInFactor[],
  identifier: string | null,
  webAuthnSupported: boolean,
): SignInFactor | null {
  const passkeyFactor = findPasskeyStrategy(factors, webAuthnSupported);
  if (passkeyFactor) {
    return passkeyFactor;
  }
  const selected = factors.sort(passwordPrefFactorComparator)[0];
  if (selected.strategy === 'password') {
    return selected;
  }
  return factors.find(factorForIdentifier(identifier)) || selected || null;
}

function determineStrategyWhenOTPIsPreferred(
  factors: SignInFactor[],
  identifier: string | null,
  webAuthnSupported: boolean,
): SignInFactor | null {
  const passkeyFactor = findPasskeyStrategy(factors, webAuthnSupported);
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

function findPasskeyStrategy(factors: SignInFactor[], webAuthnSupported: boolean): SignInFactor | null {
  if (webAuthnSupported) {
    const passkeyFactor = factors.find(({ strategy }) => strategy === 'passkey');

    if (passkeyFactor) {
      return passkeyFactor;
    }
  }
  return null;
}

const factorForIdentifier = (i: string | null) => (f: SignInFactor) => {
  return 'safeIdentifier' in f && f.safeIdentifier === i;
};

const passwordPrefFactorComparator = makeSortingFunction([
  'passkey',
  'password',
  'email_link',
  'email_code',
  'phone_code',
]);

const otpPrefFactorComparator = makeSortingFunction(['email_link', 'email_code', 'phone_code', 'passkey', 'password']);

function makeSortingFunction(order: SignInStrategy[]) {
  return (a: SignInFactor, b: SignInFactor): number => {
    const orderA = order.indexOf(a.strategy);
    const orderB = order.indexOf(b.strategy);
    if (orderA === -1 || orderB === -1) {
      return 0;
    }
    return orderA - orderB;
  };
}
