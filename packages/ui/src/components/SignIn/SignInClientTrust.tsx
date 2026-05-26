import type { SignInFactor, SignInResource } from '@clerk/shared/types';
import React from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { LoadingCard } from '@/ui/elements/LoadingCard';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '../../common';
import { useCoreSignIn } from '../../contexts';
import { SignInFactorTwoAlternativeMethods } from './SignInFactorTwoAlternativeMethods';
import { SignInFactorTwoEmailCodeCard } from './SignInFactorTwoEmailCodeCard';
import { SignInFactorTwoEmailLinkCard } from './SignInFactorTwoEmailLinkCard';
import { SignInFactorTwoPhoneCodeCard } from './SignInFactorTwoPhoneCodeCard';
import { useHandleSecondFactorResult, useHandleUserLockedError } from './useHandleAttemptResult';
import { useSecondFactorSelection } from './useSecondFactorSelection';
import { isResetPasswordStrategy } from './utils';

function SignInClientTrustInternal(): JSX.Element {
  const signIn = useCoreSignIn();
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

  const handlePrepareSecondFactor = React.useCallback(
    (factor: SignInFactor) => signIn.prepareSecondFactor(factor as any),
    [signIn],
  );

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
    showNewDeviceVerificationNotice: false,
  } as const;

  switch (currentFactor?.strategy) {
    case 'phone_code':
      return (
        <SignInFactorTwoPhoneCodeCard
          showClientTrustNotice
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          onPrepareSecondFactor={handlePrepareSecondFactor as (factor: any) => Promise<SignInResource>}
          {...codeCardProps}
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
          onPrepareSecondFactor={handlePrepareSecondFactor as (factor: any) => Promise<SignInResource>}
          {...codeCardProps}
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
