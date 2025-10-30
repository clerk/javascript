import type { SignInFactor, SignInFirstFactor, SignInSecondFactor } from '@clerk/shared/types';
import { isWebAuthnSupported } from '@clerk/shared/webauthn';
import { useMemo } from 'react';

import { allStrategiesButtonsComparator } from '@/ui/utils/factorSorting';

import { factorHasLocalStrategy, isResetPasswordStrategy } from '../SignIn/utils';

const firstFactorsAreEqual = (a: SignInFactor | null | undefined, b: SignInFactor | null | undefined) => {
  if (!a || !b) {
    return false;
  }

  if (a.strategy === 'email_code' && b.strategy === 'email_code') {
    return a.emailAddressId === b.emailAddressId;
  }

  if (a.strategy === 'phone_code' && b.strategy === 'phone_code') {
    return a.phoneNumberId === b.phoneNumberId;
  }

  return a.strategy === b.strategy;
};

export const secondFactorsAreEqual = (
  a: SignInSecondFactor | null | undefined,
  b: SignInSecondFactor | null | undefined,
) => {
  if (!a || !b) {
    return false;
  }

  if (a.strategy === 'phone_code' && b.strategy === 'phone_code') {
    return a.phoneNumberId === b.phoneNumberId;
  }

  return a.strategy === b.strategy;
};

export function useReverificationAlternativeStrategies<T = SignInFirstFactor>({
  filterOutFactor,
  supportedFirstFactors,
}: {
  filterOutFactor: SignInFactor | null | undefined;
  supportedFirstFactors: SignInFirstFactor[] | null | undefined;
}) {
  const firstFactors = supportedFirstFactors
    ? supportedFirstFactors.filter(f => !isResetPasswordStrategy(f.strategy))
    : [];
  const shouldAllowForAlternativeStrategies = firstFactors && firstFactors.length > 0;

  const firstPartyFactors = useMemo(
    () =>
      supportedFirstFactors
        ? (supportedFirstFactors
            .filter(f => !f.strategy.startsWith('oauth_'))
            .filter(factor => factorHasLocalStrategy(factor))
            .filter(factor => !firstFactorsAreEqual(factor, filterOutFactor))
            // Only include passkey if the device supports it.
            // @ts-ignore Types are not public yet.
            .filter(factor => (factor.strategy === 'passkey' ? isWebAuthnSupported() : true))
            .sort(allStrategiesButtonsComparator) as T[])
        : [],
    [supportedFirstFactors, filterOutFactor],
  );

  return {
    hasAnyStrategy: shouldAllowForAlternativeStrategies,
    hasFirstParty: firstPartyFactors && firstPartyFactors.length > 0,
    firstPartyFactors,
  };
}
