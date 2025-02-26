import type { SessionVerificationResource, SessionVerificationSecondFactor, SignInFactor } from '@clerk/types';
import React, { useEffect, useMemo } from 'react';

import { LoadingCard, withCardStateProvider } from '../../elements';
import { useRouter } from '../../router';
import { determineStartingSignInSecondFactor } from '../SignIn/utils';
import { secondFactorsAreEqual } from './useReverificationAlternativeStrategies';
import { UserVerificationFactorTwoTOTP } from './UserVerificationFactorTwoTOTP';
import { useUserVerificationSession, withUserVerificationSessionGuard } from './useUserVerificationSession';
import { UVFactorTwoAlternativeMethods } from './UVFactorTwoAlternativeMethods';
import { UVFactorTwoBackupCodeCard } from './UVFactorTwoBackupCodeCard';
import { UVFactorTwoPhoneCodeCard } from './UVFactorTwoPhoneCodeCard';

const factorKey = (factor: SignInFactor | null | undefined) => {
  if (!factor) {
    return '';
  }
  let key = factor.strategy;
  if ('phoneNumberId' in factor) {
    key += factor.phoneNumberId;
  }
  return key;
};

export function UserVerificationFactorTwoComponent(): JSX.Element {
  const { navigate } = useRouter();
  const { data } = useUserVerificationSession();
  const sessionVerification = data as SessionVerificationResource;

  const availableFactors = sessionVerification.supportedSecondFactors;

  const lastPreparedFactorKeyRef = React.useRef('');
  const [currentFactor, setCurrentFactor] = React.useState<SessionVerificationSecondFactor | null>(
    () => determineStartingSignInSecondFactor(availableFactors) as SessionVerificationSecondFactor,
  );
  const [showAllStrategies, setShowAllStrategies] = React.useState<boolean>(!currentFactor);
  const toggleAllStrategies = () => setShowAllStrategies(s => !s);

  const secondFactorsExcludingCurrent = useMemo(
    () => availableFactors?.filter(factor => !secondFactorsAreEqual(factor, currentFactor)),
    [availableFactors, currentFactor],
  );

  const handleFactorPrepare = () => {
    lastPreparedFactorKeyRef.current = factorKey(currentFactor);
  };

  const selectFactor = (factor: SessionVerificationSecondFactor) => {
    setCurrentFactor(factor);
    toggleAllStrategies();
  };

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
        supportedSecondFactors={secondFactorsExcludingCurrent}
        onBackLinkClick={toggleAllStrategies}
        onFactorSelected={selectFactor}
      />
    );
  }

  switch (currentFactor?.strategy) {
    case 'phone_code':
      return (
        <UVFactorTwoPhoneCodeCard
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          showAlternativeMethods={hasAlternativeStrategies}
        />
      );
    case 'totp':
      return (
        <UserVerificationFactorTwoTOTP
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
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
