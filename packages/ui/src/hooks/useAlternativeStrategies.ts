import type { SignInFactor, SignInFirstFactor } from '@clerk/shared/types';
import { isWebAuthnSupported } from '@clerk/shared/webauthn';

import { factorHasLocalStrategy, isResetPasswordStrategy } from '../components/SignIn/utils';
import { allStrategiesButtonsComparator } from '../utils/factorSorting';
import { useEnabledThirdPartyProviders } from './useEnabledThirdPartyProviders';

export function useAlternativeStrategies<T = SignInFirstFactor>({
  filterOutFactor,
  supportedFirstFactors: _supportedFirstFactors,
}: {
  filterOutFactor: SignInFactor | null | undefined;
  supportedFirstFactors: SignInFirstFactor[] | null | undefined;
}) {
  const { strategies: OAuthStrategies } = useEnabledThirdPartyProviders();
  const supportedFirstFactors = _supportedFirstFactors || [];

  const firstFactors = supportedFirstFactors.filter(
    f => f.strategy !== filterOutFactor?.strategy && !isResetPasswordStrategy(f.strategy),
  );

  const shouldAllowForAlternativeStrategies = firstFactors.length + OAuthStrategies.length > 0;

  const firstPartyFactors = supportedFirstFactors
    .filter(f => !f.strategy.startsWith('oauth_') && !(f.strategy === filterOutFactor?.strategy))
    .filter(factor => factorHasLocalStrategy(factor))
    // Only include passkey if the device supports it.
    // @ts-ignore Types are not public yet.
    .filter(factor => (factor.strategy === 'passkey' ? isWebAuthnSupported() : true))
    .sort(allStrategiesButtonsComparator) as T[];

  return {
    hasAnyStrategy: shouldAllowForAlternativeStrategies,
    hasFirstParty: !!firstPartyFactors,
    firstPartyFactors,
  };
}
