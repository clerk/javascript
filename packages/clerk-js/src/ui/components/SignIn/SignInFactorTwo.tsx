import { useClerk } from '@clerk/shared/react';
import type { SignInFactor } from '@clerk/shared/types';
import React from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';
import { LoadingCard } from '@/ui/elements/LoadingCard';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '../../common';
import { useCoreSignIn } from '../../contexts';
import { useRouter } from '../../router';
import { SignInFactorTwoAlternativeMethods } from './SignInFactorTwoAlternativeMethods';
import { SignInFactorTwoBackupCodeCard } from './SignInFactorTwoBackupCodeCard';
import { SignInFactorTwoEmailCodeCard } from './SignInFactorTwoEmailCodeCard';
import { SignInFactorTwoEmailLinkCard } from './SignInFactorTwoEmailLinkCard';
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

function SignInFactorTwoInternal(): JSX.Element {
  const { __internal_setActiveInProgress } = useClerk();
  const signIn = useCoreSignIn();
  const router = useRouter();
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

  React.useEffect(() => {
    if (__internal_setActiveInProgress) {
      return;
    }

    // If the sign-in was reset or doesn't exist, redirect back to the start.
    // Don't redirect for 'complete' status - setActive will handle navigation.
    if (signIn.status === null || signIn.status === 'needs_identifier' || signIn.status === 'needs_first_factor') {
      void router.navigate('../');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Match SignInFactorOne pattern: only run on mount and when setActiveInProgress changes
  }, [__internal_setActiveInProgress]);

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
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
        />
      );
    case 'totp':
      return (
        <SignInFactorTwoTOTPCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
        />
      );
    case 'backup_code':
      return <SignInFactorTwoBackupCodeCard onShowAlternativeMethodsClicked={toggleAllStrategies} />;
    case 'email_code':
      return (
        <SignInFactorTwoEmailCodeCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
        />
      );
    case 'email_link':
      return (
        <SignInFactorTwoEmailLinkCard
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

export const SignInFactorTwo = withRedirectToSignInTask(
  withRedirectToAfterSignIn(withCardStateProvider(SignInFactorTwoInternal)),
);
