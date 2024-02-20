import type { ResetPasswordCodeFactor, SignInFactor } from '@clerk/types';
import React from 'react';

import { withRedirectToAfterSignIn } from '../../common';
import { useCoreSignIn, useEnvironment } from '../../contexts';
import { ErrorCard, LoadingCard, withCardStateProvider } from '../../elements';
import { useAlternativeStrategies } from '../../hooks/useAlternativeStrategies';
import { localizationKeys } from '../../localization';
import { useRouter } from '../../router';
import { AlternativeMethods } from './AlternativeMethods';
import { SignInFactorOneEmailCodeCard } from './SignInFactorOneEmailCodeCard';
import { SignInFactorOneEmailLinkCard } from './SignInFactorOneEmailLinkCard';
import { SignInFactorOneForgotPasswordCard } from './SignInFactorOneForgotPasswordCard';
import { SignInFactorOnePasskey } from './SignInFactorOnePasskey';
import { SignInFactorOnePasswordCard } from './SignInFactorOnePasswordCard';
import { SignInFactorOnePhoneCodeCard } from './SignInFactorOnePhoneCodeCard';
import { useResetPasswordFactor } from './useResetPasswordFactor';
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
  console.log('Prefered', preferredSignInStrategy);
  const availableFactors = signIn.supportedFirstFactors;
  const router = useRouter();

  const lastPreparedFactorKeyRef = React.useRef('');
  const [{ currentFactor }, setFactor] = React.useState<{
    currentFactor: SignInFactor | undefined | null;
    prevCurrentFactor: SignInFactor | undefined | null;
  }>(() => ({
    // TODO: bring back `preferredSignInStrategy`
    currentFactor: determineStartingSignInFactor(availableFactors, signIn.identifier, 'passkey'),
    prevCurrentFactor: undefined,
  }));

  const { hasAnyStrategy } = useAlternativeStrategies({
    filterOutFactor: currentFactor,
  });

  const [showAllStrategies, setShowAllStrategies] = React.useState<boolean>(
    () => !currentFactor || !factorHasLocalStrategy(currentFactor),
  );

  const resetPasswordFactor = useResetPasswordFactor();

  const [showForgotPasswordStrategies, setShowForgotPasswordStrategies] = React.useState(false);

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

  const toggleAllStrategies = hasAnyStrategy ? () => setShowAllStrategies(s => !s) : undefined;

  const toggleForgotPasswordStrategies = () => setShowForgotPasswordStrategies(s => !s);

  const handleFactorPrepare = () => {
    lastPreparedFactorKeyRef.current = factorKey(currentFactor);
  };
  const selectFactor = (factor: SignInFactor) => {
    setFactor(prev => ({
      currentFactor: factor,
      prevCurrentFactor: prev.currentFactor,
    }));
  };
  if (showAllStrategies || showForgotPasswordStrategies) {
    const canGoBack = factorHasLocalStrategy(currentFactor);

    const toggle = showAllStrategies ? toggleAllStrategies : toggleForgotPasswordStrategies;

    return (
      <AlternativeMethods
        asForgotPassword={showForgotPasswordStrategies}
        onBackLinkClick={canGoBack ? toggle : undefined}
        onFactorSelected={f => {
          selectFactor(f);
          toggle?.();
        }}
        currentFactor={currentFactor}
      />
    );
  }

  if (!currentFactor) {
    return <LoadingCard />;
  }

  switch (currentFactor?.strategy) {
    case 'passkey':
      return (
        <SignInFactorOnePasskey
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
          onForgotPasswordMethodClick={resetPasswordFactor ? toggleForgotPasswordStrategies : toggleAllStrategies}
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
    case 'reset_password_phone_code':
      return (
        <SignInFactorOneForgotPasswordCard
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          onBackLinkClicked={() => {
            setFactor(prev => ({
              currentFactor: prev.prevCurrentFactor,
              prevCurrentFactor: prev.currentFactor,
            }));
            toggleForgotPasswordStrategies();
          }}
          cardSubtitle={localizationKeys('signIn.forgotPassword.subtitle_phone')}
        />
      );

    case 'reset_password_email_code':
      return (
        <SignInFactorOneForgotPasswordCard
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          onBackLinkClicked={() => {
            setFactor(prev => ({
              currentFactor: prev.prevCurrentFactor,
              prevCurrentFactor: prev.currentFactor,
            }));
            toggleForgotPasswordStrategies();
          }}
          cardSubtitle={localizationKeys('signIn.forgotPassword.subtitle_email')}
        />
      );
    default:
      return <LoadingCard />;
  }
}

export const SignInFactorOne = withRedirectToAfterSignIn(withCardStateProvider(_SignInFactorOne));
