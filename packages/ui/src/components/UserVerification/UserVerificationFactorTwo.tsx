import type { SessionVerificationResource, SessionVerificationSecondFactor } from '@clerk/shared/types';
import { useEffect, useMemo } from 'react';

import { useRouter } from '@/router';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { LoadingCard } from '@/ui/elements/LoadingCard';

import { useSecondFactorSelection } from '../SignIn/useSecondFactorSelection';
import { secondFactorsAreEqual } from './useReverificationAlternativeStrategies';
import { UserVerificationFactorTwoTOTP } from './UserVerificationFactorTwoTOTP';
import { useUserVerificationSession, withUserVerificationSessionGuard } from './useUserVerificationSession';
import { sortByPrimaryFactor } from './utils';
import { UVFactorTwoAlternativeMethods } from './UVFactorTwoAlternativeMethods';
import { UVFactorTwoBackupCodeCard } from './UVFactorTwoBackupCodeCard';
import { UVFactorTwoPhoneCodeCard } from './UVFactorTwoPhoneCodeCard';

const SUPPORTED_STRATEGIES: SessionVerificationSecondFactor['strategy'][] = [
  'phone_code',
  'totp',
  'backup_code',
] as const;

export function UserVerificationFactorTwoComponent(): JSX.Element {
  const { navigate } = useRouter();
  const { data } = useUserVerificationSession();
  const sessionVerification = data as SessionVerificationResource;

  const availableFactors = useMemo(() => {
    return (
      sessionVerification.supportedSecondFactors
        ?.filter(factor => SUPPORTED_STRATEGIES.includes(factor.strategy))
        ?.sort(sortByPrimaryFactor) || null
    );
  }, [sessionVerification.supportedSecondFactors]);

  const {
    currentFactor,
    factorAlreadyPrepared,
    handleFactorPrepare,
    selectFactor,
    showAllStrategies,
    toggleAllStrategies,
  } = useSecondFactorSelection<SessionVerificationSecondFactor>(availableFactors);

  const secondFactorsExcludingCurrent = useMemo(
    () => availableFactors?.filter(factor => !secondFactorsAreEqual(factor, currentFactor)),
    [availableFactors, currentFactor],
  );

  const hasAlternativeStrategies = useMemo(
    () => (secondFactorsExcludingCurrent && secondFactorsExcludingCurrent.length > 0) || false,
    [secondFactorsExcludingCurrent],
  );

  useEffect(() => {
    if (sessionVerification.status === 'needs_first_factor') {
      void navigate('../');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentFactor) {
    return <LoadingCard />;
  }

  if (showAllStrategies && hasAlternativeStrategies) {
    return (
      <UVFactorTwoAlternativeMethods
        supportedSecondFactors={secondFactorsExcludingCurrent || null}
        onBackLinkClick={toggleAllStrategies}
        onFactorSelected={selectFactor}
      />
    );
  }

  switch (currentFactor?.strategy) {
    case 'phone_code':
      return (
        <UVFactorTwoPhoneCodeCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          showAlternativeMethods={hasAlternativeStrategies}
        />
      );
    case 'totp':
      return (
        <UserVerificationFactorTwoTOTP
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          showAlternativeMethods={hasAlternativeStrategies}
        />
      );
    case 'backup_code':
      return <UVFactorTwoBackupCodeCard onShowAlternativeMethodsClicked={toggleAllStrategies} />;
    default:
      return <LoadingCard />;
  }
}

export const UserVerificationFactorTwo = withUserVerificationSessionGuard(
  withCardStateProvider(UserVerificationFactorTwoComponent),
);
