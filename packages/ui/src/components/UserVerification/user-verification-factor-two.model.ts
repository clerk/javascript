import type { SessionVerificationResource, SessionVerificationSecondFactor } from '@clerk/shared/types';
import { useMemo } from 'react';

import { useRouter } from '@/router';

import { secondFactorsAreEqual } from './useReverificationAlternativeStrategies';
import { useUserVerificationSession } from './useUserVerificationSession';
import { sortByPrimaryFactor } from './utils';

const SUPPORTED_STRATEGIES: SessionVerificationSecondFactor['strategy'][] = [
  'phone_code',
  'totp',
  'backup_code',
] as const;

export const useUserVerificationFactorTwoModel = () => {
  const { navigate } = useRouter();
  const { data } = useUserVerificationSession();
  const sessionVerification = data as SessionVerificationResource;
  const availableFactors = useMemo(
    () =>
      sessionVerification.supportedSecondFactors
        ?.filter(factor => SUPPORTED_STRATEGIES.includes(factor.strategy))
        ?.sort(sortByPrimaryFactor) || null,
    [sessionVerification.supportedSecondFactors],
  );

  return {
    status: 'ready' as const,
    sessionStatus: sessionVerification.status,
    availableFactors,
    navigateToFactorOne: () => navigate('../'),
  };
};

export const useUserVerificationFactorTwoAlternativesModel = (
  availableFactors: ReturnType<typeof useUserVerificationFactorTwoModel>['availableFactors'],
  currentFactor: SessionVerificationSecondFactor | null,
) => {
  const secondFactorsExcludingCurrent = useMemo(
    () => availableFactors?.filter(factor => !secondFactorsAreEqual(factor, currentFactor)),
    [availableFactors, currentFactor],
  );
  const hasAlternativeStrategies = useMemo(
    () => (secondFactorsExcludingCurrent && secondFactorsExcludingCurrent.length > 0) || false,
    [secondFactorsExcludingCurrent],
  );

  return { secondFactorsExcludingCurrent, hasAlternativeStrategies };
};
