import { useClerk } from '@clerk/shared/react';
import type { SignInFactor, SignInResource } from '@clerk/shared/types';
import React, { useMemo } from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { LoadingCard } from '@/ui/elements/LoadingCard';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '../../common';
import { useCoreSignIn, useEnvironment, useSignInContext } from '../../contexts';
import { useRouter } from '../../router';
import { SignInFactorTwoAlternativeMethods } from './SignInFactorTwoAlternativeMethods';
import { SignInFactorTwoBackupCodeCard } from './SignInFactorTwoBackupCodeCard';
import { SignInFactorTwoEmailCodeCard } from './SignInFactorTwoEmailCodeCard';
import { SignInFactorTwoEmailLinkCard } from './SignInFactorTwoEmailLinkCard';
import { SignInFactorTwoPhoneCodeCard } from './SignInFactorTwoPhoneCodeCard';
import { SignInFactorTwoTOTPCard } from './SignInFactorTwoTOTPCard';
import { useHandleSecondFactorResult, useHandleUserLockedError } from './useHandleAttemptResult';
import { useSecondFactorSelection } from './useSecondFactorSelection';
import { isResetPasswordStrategy } from './utils';

function SignInFactorTwoInternal(): JSX.Element {
  const clerk = useClerk();
  const signIn = useCoreSignIn();
  const env = useEnvironment();
  const router = useRouter();
  const { afterSignInUrl } = useSignInContext();
  const handleSecondFactorResult = useHandleSecondFactorResult();
  const handleUserLockedError = useHandleUserLockedError();
  const {
    currentFactor,
    factorAlreadyPrepared,
    handleFactorPrepare,
    selectFactor,
    showAllStrategies,
    toggleAllStrategies,
  } = useSecondFactorSelection(signIn.supportedSecondFactors);

  const isResettingPassword =
    isResetPasswordStrategy(signIn.firstFactorVerification?.strategy) &&
    signIn.firstFactorVerification?.status === 'verified';

  const showNewDeviceVerificationNotice = useMemo(() => {
    const anyAttributeUsedForSecondFactor = Object.values(env.userSettings.attributes).some(
      attr => attr.used_for_second_factor,
    );
    return signIn.clientTrustState === 'new' && !anyAttributeUsedForSecondFactor;
  }, [signIn.clientTrustState, env.userSettings.attributes]);

  const handleAttemptCode: VerificationCodeCardProps['onCodeEntryFinishedAction'] = React.useCallback(
    (code: string, resolve: () => Promise<void>, reject: (err: unknown) => void) => {
      if (!currentFactor) {
        return;
      }
      signIn
        .attemptSecondFactor({ strategy: currentFactor.strategy as any, code })
        .then(async res => {
          await resolve();
          return handleSecondFactorResult(res);
        })
        .catch(err => {
          if (handleUserLockedError(err)) {
            return;
          }
          return reject(err);
        });
    },
    [signIn, currentFactor, handleSecondFactorResult, handleUserLockedError],
  );

  const handleAttemptBackupCode = React.useCallback(
    async (code: string) => {
      try {
        const res = await signIn.attemptSecondFactor({ strategy: 'backup_code', code });
        await handleSecondFactorResult(res);
      } catch (err) {
        if (handleUserLockedError(err)) {
          return;
        }
        throw err;
      }
    },
    [signIn, handleSecondFactorResult, handleUserLockedError],
  );

  const handlePrepareSecondFactor = React.useCallback(
    (factor: SignInFactor) => signIn.prepareSecondFactor(factor as any),
    [signIn],
  );

  React.useEffect(() => {
    if (clerk.__internal_setActiveInProgress) {
      return;
    }

    if (signIn.status === null || signIn.status === 'needs_identifier' || signIn.status === 'needs_first_factor') {
      if (clerk.isSignedIn) {
        void router.navigate(afterSignInUrl);
      } else {
        void router.navigate('../');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only run on mount and when setActiveInProgress changes
  }, [clerk.__internal_setActiveInProgress]);

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

  const codeCardProps = {
    onAttemptCode: handleAttemptCode,
    avatarUrl: signIn.userData.imageUrl,
    isResettingPassword,
    showNewDeviceVerificationNotice,
  } as const;

  switch (currentFactor?.strategy) {
    case 'phone_code':
      return (
        <SignInFactorTwoPhoneCodeCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          onPrepareSecondFactor={handlePrepareSecondFactor as (factor: any) => Promise<SignInResource>}
          {...codeCardProps}
        />
      );
    case 'totp':
      return (
        <SignInFactorTwoTOTPCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          {...codeCardProps}
        />
      );
    case 'backup_code':
      return (
        <SignInFactorTwoBackupCodeCard
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          onAttemptBackupCode={handleAttemptBackupCode}
          isResettingPassword={isResettingPassword}
        />
      );
    case 'email_code':
      return (
        <SignInFactorTwoEmailCodeCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          onPrepareSecondFactor={handlePrepareSecondFactor as (factor: any) => Promise<SignInResource>}
          {...codeCardProps}
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
