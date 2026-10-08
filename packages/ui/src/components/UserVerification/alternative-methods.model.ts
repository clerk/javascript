import type { SessionVerificationFirstFactor, SignInFactor } from '@clerk/shared/types';

import { useReverificationAlternativeStrategies } from './useReverificationAlternativeStrategies';
import { useUserVerificationSession } from './useUserVerificationSession';

export const useAlternativeMethodsModel = (currentFactor: SignInFactor | undefined | null) => {
  const { data } = useUserVerificationSession();
  const { firstPartyFactors, hasAlternativeStrategies } =
    useReverificationAlternativeStrategies<SessionVerificationFirstFactor>({
      filterOutFactor: currentFactor,
      supportedFirstFactors: data?.supportedFirstFactors,
    });

  return { firstPartyFactors, hasAlternativeStrategies };
};
