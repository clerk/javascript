import type { ResetPasswordCodeFactor, SignInFactor } from '@clerk/types';
import React from 'react';

import { withRedirectToHomeSingleSessionGuard } from '../../common';
import { useCoreSignIn, useEnvironment } from '../../contexts';
import { ErrorCard, LoadingCard, withCardStateProvider } from '../../elements';
import { localizationKeys } from '../../localization';
import { useRouter } from '../../router';
import { AlternativeMethods } from './AlternativeMethods';
import { SignInFactorOneEmailCodeCard } from './SignInFactorOneEmailCodeCard';
import { SignInFactorOneEmailLinkCard } from './SignInFactorOneEmailLinkCard';
import { SignInFactorOneForgotPasswordCard } from './SignInFactorOneForgotPasswordCard';
import { SignInFactorOnePasswordCard } from './SignInFactorOnePasswordCard';
import { SignInFactorOnePhoneCodeCard } from './SignInFactorOnePhoneCodeCard';
import { determineStartingSignInFactor, factorHasLocalStrategy } from './utils';

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
  const [{ currentFactor }, setFactor] = React.useState<{
    currentFactor: SignInFactor | undefined | null;
    prevCurrentFactor: SignInFactor | undefined | null;
  }>(() => ({
    currentFactor: determineStartingSignInFactor(availableFactors, signIn.identifier, preferredSignInStrategy),
    prevCurrentFactor: undefined,
  }));
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
        cardTitle={localizationKeys('signIn.noAvailableMethods.title')}
        cardSubtitle={localizationKeys('signIn.noAvailableMethods.subtitle')}
        message={localizationKeys('signIn.noAvailableMethods.message')}
      />
    );
  }

  const toggleAllStrategies = () => setShowAllStrategies(s => !s);
  const handleFactorPrepare = () => {
    lastPreparedFactorKeyRef.current = factorKey(currentFactor);
  };
  const selectFactor = (factor: SignInFactor) => {
    setFactor(prev => ({
      currentFactor: factor,
      prevCurrentFactor: prev.currentFactor,
    }));
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
      return (
        <SignInFactorOnePasswordCard
          onFactorPrepare={(factor: ResetPasswordCodeFactor) => {
            handleFactorPrepare();
            setFactor(prev => ({
              currentFactor: {
                ...factor,
              },
              prevCurrentFactor: prev.currentFactor,
            }));
          }}
          onShowAlternativeMethodsClick={toggleAllStrategies}
        />
      );
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
    case 'reset_password_code':
      return (
        <SignInFactorOneForgotPasswordCard
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          onBackLinkClicked={() =>
            setFactor(prev => ({
              currentFactor: prev.prevCurrentFactor,
              prevCurrentFactor: prev.currentFactor,
            }))
          }
        />
      );
    default:
      return <LoadingCard />;
  }
}

export const SignInFactorOne = withRedirectToHomeSingleSessionGuard(withCardStateProvider(_SignInFactorOne));
