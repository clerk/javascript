import type { SessionVerificationResource, SessionVerificationSecondFactor, SignInFactor } from '@clerk/types';
import React, { useEffect } from 'react';

import { LoadingCard, withCardStateProvider } from '../../elements';
import { useRouter } from '../../router';
import { determineStartingSignInSecondFactor } from '../SignIn/utils';
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

export function _UserVerificationFactorTwo(): JSX.Element {
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

  const handleFactorPrepare = () => {
    lastPreparedFactorKeyRef.current = factorKey(currentFactor);
  };

  const selectFactor = (factor: SessionVerificationSecondFactor) => {
    setCurrentFactor(factor);
    toggleAllStrategies();
  };

  useEffect(() => {
    if (sessionVerification.status === 'needs_first_factor') {
      void navigate('../');
    }
  }, []);

  if (!currentFactor) {
    return <LoadingCard />;
  }

  if (showAllStrategies) {
    return (
      <UVFactorTwoAlternativeMethods
        supportedSecondFactors={sessionVerification.supportedSecondFactors}
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
        />
      );
    case 'totp':
      return (
        <UserVerificationFactorTwoTOTP
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
        />
      );
    case 'backup_code':
      return <UVFactorTwoBackupCodeCard onShowAlternativeMethodsClicked={toggleAllStrategies} />;
    default:
      return <LoadingCard />;
  }
}

export const UserVerificationFactorTwo = withUserVerificationSessionGuard(
  withCardStateProvider(_UserVerificationFactorTwo),
);
