import { isPasswordCompromisedError, isPasswordPwnedError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import type { SignInFactor } from '@clerk/shared/types';
import React from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { ErrorCard } from '@/ui/elements/ErrorCard';
import { LoadingCard } from '@/ui/elements/LoadingCard';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '../../common';
import { useCoreSignIn, useEnvironment } from '../../contexts';
import { useAlternativeStrategies } from '../../hooks/useAlternativeStrategies';
import { localizationKeys } from '../../localization';
import { useRouter } from '../../router';
import type { AlternativeMethodsMode } from './AlternativeMethods';
import { AlternativeMethods } from './AlternativeMethods';
import { hasMultipleEnterpriseConnections } from './shared';
import { SignInFactorOneAlternativePhoneCodeCard } from './SignInFactorOneAlternativePhoneCodeCard';
import { SignInFactorOneEmailCodeCard } from './SignInFactorOneEmailCodeCard';
import { SignInFactorOneEmailLinkCard } from './SignInFactorOneEmailLinkCard';
import { SignInFactorOneEnterpriseConnections } from './SignInFactorOneEnterpriseConnections';
import { SignInFactorOneForgotPasswordCard } from './SignInFactorOneForgotPasswordCard';
import { SignInFactorOnePasskey } from './SignInFactorOnePasskey';
import type { PasswordErrorCode } from './SignInFactorOnePasswordCard';
import { SignInFactorOnePasswordCard } from './SignInFactorOnePasswordCard';
import { SignInFactorOnePhoneCodeCard } from './SignInFactorOnePhoneCodeCard';
import { useHandleFirstFactorResult, useHandleUserLockedError } from './useHandleAttemptResult';
import { useResetPasswordFactor } from './useResetPasswordFactor';
import { determineStartingSignInFactor, factorHasLocalStrategy, factorKey } from './utils';

function determineAlternativeMethodsMode(
  showForgotPasswordStrategies: boolean,
  passwordErrorCode: PasswordErrorCode | null,
): AlternativeMethodsMode {
  if (!showForgotPasswordStrategies) {
    return 'default';
  }

  if (passwordErrorCode === 'pwned') {
    return 'pwned';
  }

  if (passwordErrorCode === 'compromised') {
    return 'passwordCompromised';
  }

  return 'forgot';
}

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

  const [passwordErrorCode, setPasswordErrorCode] = React.useState<PasswordErrorCode | null>(null);

  const handleFirstFactorResult = useHandleFirstFactorResult();
  const handleUserLockedError = useHandleUserLockedError();

  const goBack = React.useCallback(() => {
    void router.navigate('../');
  }, [router]);

  const handleAttemptPassword = React.useCallback(
    async (password: string) => {
      try {
        const res = await signIn.attemptFirstFactor({ strategy: 'password', password });
        await handleFirstFactorResult(res);
      } catch (err: any) {
        if (handleUserLockedError(err)) {
          return;
        }
        if (isPasswordPwnedError(err)) {
          card.setError({ ...err.errors[0], code: 'form_password_pwned__sign_in' });
          setPasswordErrorCode('pwned');
          setShowForgotPasswordStrategies(s => !s);
          return;
        }
        if (isPasswordCompromisedError(err)) {
          card.setError({ ...err.errors[0], code: 'form_password_compromised__sign_in' });
          setPasswordErrorCode('compromised');
          setShowForgotPasswordStrategies(s => !s);
          return;
        }
        throw err;
      }
    },
    [signIn, handleFirstFactorResult, handleUserLockedError, card],
  );

  const handleAttemptCode = React.useCallback(
    (code: string, resolve: () => Promise<void>, reject: (err: unknown) => void) => {
      if (!currentFactor) {
        return;
      }
      signIn
        .attemptFirstFactor({ strategy: currentFactor.strategy as any, code })
        .then(async res => {
          await resolve();
          return handleFirstFactorResult(res);
        })
        .catch(err => {
          if (handleUserLockedError(err)) {
            return;
          }
          return reject(err);
        });
    },
    [signIn, currentFactor, handleFirstFactorResult, handleUserLockedError],
  );

  const handlePrepareFirstFactor = React.useCallback(
    (factor: SignInFactor) => signIn.prepareFirstFactor(factor as any),
    [signIn],
  );

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

  /**
   * Prompt to choose between a list of enterprise connections as supported first factors
   * @experimental
   */
  if (hasMultipleEnterpriseConnections(signIn.supportedFirstFactors)) {
    return <SignInFactorOneEnterpriseConnections />;
  }

  if (showAllStrategies || showForgotPasswordStrategies) {
    // Password errors are not recoverable by re-entering the password, so we hide the back button
    const canGoBack = factorHasLocalStrategy(currentFactor) && !passwordErrorCode;

    const toggle = showAllStrategies ? toggleAllStrategies : toggleForgotPasswordStrategies;
    const backHandler = () => {
      card.setError(undefined);
      setPasswordErrorCode(null);
      toggle?.();
    };

    const mode = determineAlternativeMethodsMode(showForgotPasswordStrategies, passwordErrorCode);

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

  const factorAlreadyPrepared = lastPreparedFactorKeyRef.current === factorKey(currentFactor);
  const shouldAvoidPrepare = signIn.firstFactorVerification.status === 'verified' && factorAlreadyPrepared;
  const codeCardProps = {
    onAttemptCode: handleAttemptCode,
    onPrepare: handlePrepareFirstFactor,
    onGoBack: goBack,
    identifier: signIn.identifier,
    avatarUrl: signIn.userData.imageUrl,
    shouldAvoidPrepare,
  } as const;

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
          onAttemptPassword={handleAttemptPassword}
          onGoBack={goBack}
          identifier={signIn.identifier}
          avatarUrl={signIn.userData.imageUrl}
          hasResetPasswordFactor={!!resetPasswordFactor}
        />
      );
    case 'email_code':
      return (
        <SignInFactorOneEmailCodeCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          {...codeCardProps}
        />
      );
    case 'phone_code':
      if (currentFactor.channel && currentFactor.channel !== 'sms') {
        return (
          <SignInFactorOneAlternativePhoneCodeCard
            factorAlreadyPrepared={factorAlreadyPrepared}
            onFactorPrepare={handleFactorPrepare}
            factor={currentFactor}
            onChangePhoneCodeChannel={selectFactor}
            {...codeCardProps}
          />
        );
      } else {
        return (
          <SignInFactorOnePhoneCodeCard
            factorAlreadyPrepared={factorAlreadyPrepared}
            onFactorPrepare={handleFactorPrepare}
            factor={currentFactor}
            onShowAlternativeMethodsClicked={toggleAllStrategies}
            {...codeCardProps}
          />
        );
      }

    case 'email_link':
      return (
        <SignInFactorOneEmailLinkCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
        />
      );
    case 'reset_password_phone_code':
      return (
        <SignInFactorOneForgotPasswordCard
          factorAlreadyPrepared={factorAlreadyPrepared}
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
          {...codeCardProps}
        />
      );

    case 'reset_password_email_code':
      return (
        <SignInFactorOneForgotPasswordCard
          factorAlreadyPrepared={factorAlreadyPrepared}
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
          {...codeCardProps}
        />
      );
    default:
      return <LoadingCard />;
  }
}

export const SignInFactorOne = withRedirectToSignInTask(
  withRedirectToAfterSignIn(withCardStateProvider(SignInFactorOneInternal)),
);
