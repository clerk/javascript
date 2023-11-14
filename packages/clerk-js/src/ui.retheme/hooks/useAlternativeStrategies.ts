import type { SignInFactor } from '@clerk/types';

import { factorHasLocalStrategy, isResetPasswordStrategy } from '../components/SignIn/utils';
import { useCoreSignIn } from '../contexts';
import { allStrategiesButtonsComparator } from '../utils';
import { useEnabledThirdPartyProviders } from './useEnabledThirdPartyProviders';

export function useAlternativeStrategies({ filterOutFactor }: { filterOutFactor: SignInFactor | null | undefined }) {
  const { supportedFirstFactors } = useCoreSignIn();

  const { strategies: OAuthStrategies } = useEnabledThirdPartyProviders();

  const firstFactors = supportedFirstFactors.filter(
    f => f.strategy !== filterOutFactor?.strategy && !isResetPasswordStrategy(f.strategy),
  );

  const shouldAllowForAlternativeStrategies = firstFactors.length + OAuthStrategies.length > 0;

  const firstPartyFactors = supportedFirstFactors
    .filter(f => !f.strategy.startsWith('oauth_') && !(f.strategy === filterOutFactor?.strategy))
    .filter(factor => factorHasLocalStrategy(factor))
    .sort(allStrategiesButtonsComparator);

  return {
    hasAnyStrategy: shouldAllowForAlternativeStrategies,
    hasFirstParty: !!firstPartyFactors,
    firstPartyFactors,
  };
}
