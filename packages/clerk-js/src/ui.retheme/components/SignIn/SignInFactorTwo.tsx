import type { SignInFactor } from '@clerk/types';
import React from 'react';

import { withRedirectToHomeSingleSessionGuard } from '../../common';
import { useCoreSignIn } from '../../contexts';
import { LoadingCard, withCardStateProvider } from '../../elements';
import { SignInFactorTwoAlternativeMethods } from './SignInFactorTwoAlternativeMethods';
import { SignInFactorTwoBackupCodeCard } from './SignInFactorTwoBackupCodeCard';
import { SignInFactorTwoPhoneCodeCard } from './SignInFactorTwoPhoneCodeCard';
import { SignInFactorTwoTOTPCard } from './SignInFactorTwoTOTPCard';
import { determineStartingSignInSecondFactor } from './utils';

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

export function _SignInFactorTwo(): JSX.Element {
  const signIn = useCoreSignIn();
  const availableFactors = signIn.supportedSecondFactors;

  const lastPreparedFactorKeyRef = React.useRef('');
  const [currentFactor, setCurrentFactor] = React.useState<SignInFactor | null>(() =>
    determineStartingSignInSecondFactor(availableFactors),
  );
  const [showAllStrategies, setShowAllStrategies] = React.useState<boolean>(!currentFactor);
  const toggleAllStrategies = () => setShowAllStrategies(s => !s);

  // TODO
  const handleFactorPrepare = () => {
    lastPreparedFactorKeyRef.current = factorKey(currentFactor);
  };

  const selectFactor = (factor: SignInFactor) => {
    setCurrentFactor(factor);
    toggleAllStrategies();
  };

  if (!currentFactor) {
    return <LoadingCard />;
  }

  if (showAllStrategies) {
    return (
      <SignInFactorTwoAlternativeMethods
        onBackLinkClick={toggleAllStrategies}
        onFactorSelected={selectFactor}
      />
    );
  }

  switch (currentFactor?.strategy) {
    case 'phone_code':
      return (
        <SignInFactorTwoPhoneCodeCard
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
        />
      );
    case 'totp':
      return (
        <SignInFactorTwoTOTPCard
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
        />
      );
    case 'backup_code':
      return <SignInFactorTwoBackupCodeCard onShowAlternativeMethodsClicked={toggleAllStrategies} />;
    default:
      return <LoadingCard />;
  }
}

export const SignInFactorTwo = withRedirectToHomeSingleSessionGuard(withCardStateProvider(_SignInFactorTwo));
