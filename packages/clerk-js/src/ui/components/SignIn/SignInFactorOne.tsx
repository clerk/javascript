import { useClerk } from '@clerk/shared/react';
import type { SignInFactor } from '@clerk/types';
import React from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { ErrorCard } from '@/ui/elements/ErrorCard';
import { LoadingCard } from '@/ui/elements/LoadingCard';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '../../common';
import { useCoreSignIn, useEnvironment } from '../../contexts';
import { useAlternativeStrategies } from '../../hooks/useAlternativeStrategies';
import { localizationKeys } from '../../localization';
import { useRouter } from '../../router';
import { AlternativeMethods } from './AlternativeMethods';
import { SignInFactorOneAlternativePhoneCodeCard } from './SignInFactorOneAlternativePhoneCodeCard';
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
  if ('channel' in factor) {
    key += factor.channel;
  }
  return key;
};

function SignInFactorOneInternal(): JSX.Element {
  const { __internal_setActiveInProgress } = useClerk();
  const signIn = useCoreSignIn();
  const { preferredSignInStrategy } = useEnvironment().displayConfig;
  const availableFactors = signIn.supportedFirstFactors;
  const router = useRouter();
  const card = useCardState();
  const { supportedFirstFactors, firstFactorVerification } = useCoreSignIn();

  const lastPreparedFactorKeyRef = React.useRef('');
  const [{ currentFactor }, setFactor] = React.useState<{
    currentFactor: SignInFactor | undefined | null;
    prevCurrentFactor: SignInFactor | undefined | null;
  }>(() => {
    const factor = determineStartingSignInFactor(availableFactors, signIn.identifier, preferredSignInStrategy);
    if (
      factor?.strategy === 'phone_code' &&
      !!firstFactorVerification.channel &&
      firstFactorVerification.channel !== 'sms'
    ) {
      // This is only applied to phone_code with channel that is not 'sms'
      // because we don't want to send the channel parameter when its value is 'sms'
      factor.channel = firstFactorVerification.channel;
    }
    return {
      currentFactor: factor,
      prevCurrentFactor: undefined,
    };
  });

  const { hasAnyStrategy } = useAlternativeStrategies({
    filterOutFactor: currentFactor,
    supportedFirstFactors,
  });

  const [showAllStrategies, setShowAllStrategies] = React.useState<boolean>(
    () => !currentFactor || !factorHasLocalStrategy(currentFactor),
  );

  const resetPasswordFactor = useResetPasswordFactor();

  const [showForgotPasswordStrategies, setShowForgotPasswordStrategies] = React.useState(false);

  const [isPasswordPwned, setIsPasswordPwned] = React.useState(false);

  React.useEffect(() => {
    if (__internal_setActiveInProgress) {
      return;
    }

    // Handle the case where a user lands on alternative methods screen,
    // clicks a social button but then navigates back to sign in.
    // SignIn status resets to 'needs_identifier'
    if (signIn.status === 'needs_identifier' || signIn.status === null) {
      void router.navigate('../');
    }
  }, [__internal_setActiveInProgress]);

  if (!currentFactor) {
    return signIn.status ? (
      <ErrorCard
        cardTitle={localizationKeys('signIn.noAvailableMethods.title')}
        cardSubtitle={localizationKeys('signIn.noAvailableMethods.subtitle')}
        message={localizationKeys('signIn.noAvailableMethods.message')}
      />
    ) : (
      <LoadingCard />
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
    const backHandler = () => {
      card.setError(undefined);
      setIsPasswordPwned(false);
      toggle?.();
    };

    const mode = showForgotPasswordStrategies ? (isPasswordPwned ? 'pwned' : 'forgot') : 'default';

    return (
      <AlternativeMethods
        mode={mode}
        onBackLinkClick={canGoBack ? backHandler : undefined}
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
          onFactorPrepare={handleFactorPrepare}
          onShowAlternativeMethodsClick={toggleAllStrategies}
        />
      );
    case 'password':
      return (
        <SignInFactorOnePasswordCard
          onForgotPasswordMethodClick={resetPasswordFactor ? toggleForgotPasswordStrategies : toggleAllStrategies}
          onShowAlternativeMethodsClick={toggleAllStrategies}
          onPasswordPwned={() => {
            setIsPasswordPwned(true);
            toggleForgotPasswordStrategies();
          }}
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
      if (currentFactor.channel && currentFactor.channel !== 'sms') {
        // Alternative phone code provider (e.g. WhatsApp)
        return (
          <SignInFactorOneAlternativePhoneCodeCard
            factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
            onFactorPrepare={handleFactorPrepare}
            factor={currentFactor}
            onChangePhoneCodeChannel={selectFactor}
          />
        );
      } else {
        // SMS
        return (
          <SignInFactorOnePhoneCodeCard
            factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
            onFactorPrepare={handleFactorPrepare}
            factor={currentFactor}
            onShowAlternativeMethodsClicked={toggleAllStrategies}
          />
        );
      }

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

export const SignInFactorOne = withRedirectToSignInTask(
  withRedirectToAfterSignIn(withCardStateProvider(SignInFactorOneInternal)),
);
