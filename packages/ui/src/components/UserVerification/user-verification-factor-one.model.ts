import type { SessionVerificationFirstFactor, SignInFactor } from '@clerk/shared/types';
import { useMemo } from 'react';

import { useEnvironment } from '../../contexts';
import { useRouter } from '../../router';
import { useReverificationAlternativeStrategies } from './useReverificationAlternativeStrategies';
import { useUserVerificationSession } from './useUserVerificationSession';
import { sortByPrimaryFactor } from './utils';

const SUPPORTED_STRATEGIES: SessionVerificationFirstFactor['strategy'][] = [
  'password',
  'email_code',
  'phone_code',
  'passkey',
] as const;

export const useUserVerificationFactorOneModel = () => {
  const { data } = useUserVerificationSession();
  const { navigate } = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sessionVerification = data!;
  const availableFactors = useMemo(
    () =>
      sessionVerification.supportedFirstFactors
        ?.filter(factor => SUPPORTED_STRATEGIES.includes(factor.strategy))
        ?.sort(sortByPrimaryFactor) || null,
    [sessionVerification.supportedFirstFactors],
  );
  const { preferredSignInStrategy } = useEnvironment().displayConfig;

  return {
    status: 'ready' as const,
    sessionStatus: sessionVerification.status,
    availableFactors,
    preferredSignInStrategy,
    navigateToFactorTwo: () => navigate('factor-two'),
  };
};

export const useUserVerificationFactorOneAlternativesModel = (
  availableFactors: ReturnType<typeof useUserVerificationFactorOneModel>['availableFactors'],
  currentFactor: SignInFactor | null | undefined,
) =>
  useReverificationAlternativeStrategies({
    filterOutFactor: currentFactor,
    supportedFirstFactors: availableFactors,
  });
