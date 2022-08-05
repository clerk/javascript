import { SignInFactor } from '@clerk/types';
import React from 'react';

import { withRedirectToHome } from '../../ui/common/withRedirectToHome';
import { useCoreSignIn, useEnvironment } from '../../ui/contexts';
import { useRouter } from '../../ui/router';
import { determineStartingSignInFactor, factorHasLocalStrategy } from '../../ui/signIn/utils';
import { ErrorCard, LoadingCard, withCardStateProvider } from '../elements';
import { AlternativeMethods } from './AlternativeMethods';
import { SignInFactorOneEmailCodeCard } from './SignInFactorOneEmailCodeCard';
import { SignInFactorOneEmailLinkCard } from './SignInFactorOneEmailLinkCard';
import { SignInFactorOnePasswordCard } from './SignInFactorOnePasswordCard';
import { SignInFactorOnePhoneCodeCard } from './SignInFactorOnePhoneCodeCard';

const factorKey = (factor: SignInFactor | null | undefined) => {
  if (!factor) {
    return '';
  }
  let key = factor.strategy;
  if ('emailAddressId' in factor) {
    key += factor.emailAddressId;
  }
  if ('phoneNumberId' in factor) {
    key += factor.phoneNumberId;
  }
  return key;
};

export function _SignInFactorOne(): JSX.Element {
  const signIn = useCoreSignIn();
  const { preferredSignInStrategy } = useEnvironment().displayConfig;
  const availableFactors = signIn.supportedFirstFactors;
  const router = useRouter();

  const lastPreparedFactorKeyRef = React.useRef('');
  const [currentFactor, setCurrentFactor] = React.useState<SignInFactor | undefined | null>(() =>
    determineStartingSignInFactor(availableFactors, signIn.identifier, preferredSignInStrategy),
  );
  const [showAllStrategies, setShowAllStrategies] = React.useState<boolean>(
    () => !currentFactor || !factorHasLocalStrategy(currentFactor),
  );

  React.useEffect(() => {
    // Handle the case where a user lands on alternative methods screen,
    // clicks a social button but then navigates back to sign in.
    // SignIn status resets to 'needs_identifier'
    if (signIn.status === 'needs_identifier' || signIn.status === null) {
      void router.navigate('../');
    }
  }, []);

  if (!currentFactor && signIn.status) {
    return (
      <ErrorCard
        cardTitle='Cannot sign in'
        cardSubtitle='An error occurred'
        message="Cannot proceed with sign in. There's no available authentication factor."
      />
    );
  }

  const toggleAllStrategies = () => setShowAllStrategies(s => !s);
  const handleFactorPrepare = () => {
    lastPreparedFactorKeyRef.current = factorKey(currentFactor);
  };
  const selectFactor = (factor: SignInFactor) => {
    setCurrentFactor(factor);
    toggleAllStrategies();
  };
  if (showAllStrategies) {
    const canGoBack = factorHasLocalStrategy(currentFactor);
    return (
      <AlternativeMethods
        onBackLinkClick={canGoBack ? toggleAllStrategies : undefined}
        onFactorSelected={selectFactor}
      />
    );
  }

  if (!currentFactor) {
    return <LoadingCard />;
  }

  switch (currentFactor?.strategy) {
    case 'password':
      return <SignInFactorOnePasswordCard onShowAlternativeMethodsClick={toggleAllStrategies} />;
    case 'email_code':
      return (
        <SignInFactorOneEmailCodeCard
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
        />
      );
    case 'phone_code':
      return (
        <SignInFactorOnePhoneCodeCard
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
        />
      );
    case 'email_link':
      return (
        <SignInFactorOneEmailLinkCard
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
        />
      );
    default:
      return <LoadingCard />;
  }
}

export const SignInFactorOne = withRedirectToHome(withCardStateProvider(_SignInFactorOne));
