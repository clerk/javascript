import { isPasswordCompromisedError, isPasswordPwnedError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import type { SignInFactor } from '@clerk/shared/types';
import React from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '../../common';
import { buildVerificationRedirectUrl } from '../../common/redirects';
import { useCoreSignIn, useEnvironment, useSignInContext } from '../../contexts';
import { useAlternativeStrategies } from '../../hooks/useAlternativeStrategies';
import { useRouter } from '../../router';
import type { AlternativeMethodsMode } from './AlternativeMethods';
import { hasMultipleEnterpriseConnections, useHandleAuthenticateWithPasskey } from './shared';
import type { PasswordErrorCode } from './SignInFactorOnePasswordCard';
import { SignInFactorOneView } from './SignInFactorOneView';
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
  const clerk = useClerk();
  const { __internal_setActiveInProgress } = clerk;
  const signIn = useCoreSignIn();
  const env = useEnvironment();
  const { preferredSignInStrategy } = env.displayConfig;
  const availableFactors = signIn.supportedFirstFactors;
  const router = useRouter();
  const card = useCardState();
  const signInContext = useSignInContext();
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

  const onSecondFactor = React.useCallback(() => router.navigate('../factor-two'), [router]);
  const authenticateWithPasskey = useHandleAuthenticateWithPasskey(onSecondFactor);

  const handleEmailLinkVerificationComplete = React.useCallback(
    async (si: import('@clerk/shared/types').SignInResource) => {
      if (si.status === 'complete') {
        await clerk.setActive({
          session: si.createdSessionId,
          redirectUrl: signInContext.afterSignInUrl,
        });
      } else if (si.status === 'needs_second_factor') {
        await router.navigate('../factor-two');
      }
    },
    [clerk, signInContext.afterSignInUrl, router],
  );

  const emailLinkRedirectUrl = React.useMemo(
    () =>
      buildVerificationRedirectUrl({
        ctx: signInContext,
        baseUrl: signInContext.signInUrl,
        intent: 'sign-in',
      }),
    [signInContext],
  );

  const handleEnterpriseSSO = React.useCallback(
    (enterpriseConnectionId: string) => {
      void signIn.authenticateWithRedirect({
        strategy: 'enterprise_sso',
        redirectUrl: signInContext.ssoCallbackUrl,
        redirectUrlComplete: signInContext.afterSignInUrl || '/',
        oidcPrompt: signInContext.oidcPrompt,
        continueSignIn: true,
        enterpriseConnectionId,
      });
    },
    [signIn, signInContext],
  );

  React.useEffect(() => {
    if (__internal_setActiveInProgress) {
      return;
    }

    if (signIn.status === 'needs_identifier' || signIn.status === null) {
      void router.navigate('../');
    }
  }, [__internal_setActiveInProgress]);

  const toggleAllStrategies = hasAnyStrategy ? () => setShowAllStrategies(s => !s) : undefined;
  const toggleForgotPasswordStrategies = () => setShowForgotPasswordStrategies(s => !s);

  const handleFactorPrepare = () => {
    lastPreparedFactorKeyRef.current = factorKey(currentFactor!);
  };

  const selectFactor = (factor: SignInFactor) => {
    setFactor(prev => ({
      currentFactor: factor,
      prevCurrentFactor: prev.currentFactor,
    }));
  };

  const handleClearPasswordError = () => {
    card.setError(undefined);
    setPasswordErrorCode(null);
  };

  const handleResetPasswordBackLink = () => {
    setFactor(prev => ({
      currentFactor: prev.prevCurrentFactor,
      prevCurrentFactor: prev.currentFactor,
    }));
    toggleForgotPasswordStrategies();
  };

  const factorAlreadyPrepared = currentFactor ? lastPreparedFactorKeyRef.current === factorKey(currentFactor) : false;

  const shouldAvoidPrepare = signIn.firstFactorVerification.status === 'verified' && factorAlreadyPrepared;

  const enterpriseConnections = hasMultipleEnterpriseConnections(signIn.supportedFirstFactors)
    ? signIn.supportedFirstFactors.map(ff => ({
        id: ff.enterpriseConnectionId,
        name: ff.enterpriseConnectionName,
      }))
    : [];

  return (
    <SignInFactorOneView
      currentFactor={currentFactor}
      signInStatus={signIn.status}
      showAllStrategies={showAllStrategies}
      showForgotPasswordStrategies={showForgotPasswordStrategies}
      passwordErrorCode={passwordErrorCode}
      hasAnyAlternativeStrategy={hasAnyStrategy}
      hasResetPasswordFactor={!!resetPasswordFactor}
      hasMultipleEnterpriseConnections={hasMultipleEnterpriseConnections(signIn.supportedFirstFactors)}
      factorAlreadyPrepared={factorAlreadyPrepared}
      shouldAvoidPrepare={shouldAvoidPrepare}
      identifier={signIn.identifier}
      avatarUrl={signIn.userData.imageUrl}
      enterpriseConnections={enterpriseConnections}
      onGoBack={goBack}
      onToggleAllStrategies={toggleAllStrategies}
      onToggleForgotPasswordStrategies={toggleForgotPasswordStrategies}
      onSelectFactor={selectFactor}
      onFactorPrepare={handleFactorPrepare}
      onClearPasswordError={handleClearPasswordError}
      onAttemptPassword={handleAttemptPassword}
      onAttemptCode={handleAttemptCode}
      onPrepareFirstFactor={handlePrepareFirstFactor}
      authenticateWithPasskey={async () => {
        await authenticateWithPasskey();
      }}
      onEnterpriseSSO={handleEnterpriseSSO}
      signIn={signIn}
      onEmailLinkVerificationComplete={handleEmailLinkVerificationComplete}
      onUserLockedError={handleUserLockedError}
      emailLinkRedirectUrl={emailLinkRedirectUrl}
      alternativeMethodsMode={determineAlternativeMethodsMode(showForgotPasswordStrategies, passwordErrorCode)}
      onResetPasswordBackLink={handleResetPasswordBackLink}
    />
  );
}

export const SignInFactorOne = withRedirectToSignInTask(
  withRedirectToAfterSignIn(withCardStateProvider(SignInFactorOneInternal)),
);
