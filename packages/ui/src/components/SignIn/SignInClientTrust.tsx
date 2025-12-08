import type { SignInFactor } from '@clerk/shared/types';
import React from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';
import { LoadingCard } from '@/ui/elements/LoadingCard';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '../../common';
import { useCoreSignIn } from '../../contexts';
import { SignInFactorTwoAlternativeMethods } from './SignInFactorTwoAlternativeMethods';
import { SignInFactorTwoEmailCodeCard } from './SignInFactorTwoEmailCodeCard';
import { SignInFactorTwoEmailLinkCard } from './SignInFactorTwoEmailLinkCard';
import { SignInFactorTwoPhoneCodeCard } from './SignInFactorTwoPhoneCodeCard';
import { determineStartingSignInSecondFactor, factorKey } from './utils';

function SignInClientTrustInternal(): JSX.Element {
  const signIn = useCoreSignIn();
  const availableFactors = signIn.supportedSecondFactors;

  const lastPreparedFactorKeyRef = React.useRef('');
  const [currentFactor, setCurrentFactor] = React.useState<SignInFactor | null>(() =>
    determineStartingSignInSecondFactor(availableFactors),
  );
  const [showAllStrategies, setShowAllStrategies] = React.useState<boolean>(!currentFactor);
  const toggleAllStrategies = () => setShowAllStrategies(s => !s);

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

  const factorAlreadyPrepared = lastPreparedFactorKeyRef.current === factorKey(currentFactor);
  switch (currentFactor?.strategy) {
    case 'phone_code':
      return (
        <SignInFactorTwoPhoneCodeCard
          showClientTrustNotice
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
        />
      );
    case 'email_code':
      return (
        <SignInFactorTwoEmailCodeCard
          showClientTrustNotice
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
        />
      );
    case 'email_link':
      return (
        <SignInFactorTwoEmailLinkCard
          showClientTrustNotice
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
        />
      );
    default:
      return <LoadingCard />;
  }
}

export const SignInClientTrust = withRedirectToSignInTask(
  withRedirectToAfterSignIn(withCardStateProvider(SignInClientTrustInternal)),
);
