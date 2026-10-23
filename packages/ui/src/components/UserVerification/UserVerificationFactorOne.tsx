import type {
  ResetPasswordEmailCodeFactor,
  ResetPasswordPhoneCodeFactor,
  SessionVerificationFirstFactor,
  SignInFactor,
} from '@clerk/shared/types';
import React, { useEffect, useMemo } from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { ErrorCard } from '@/ui/elements/ErrorCard';
import { LoadingCard } from '@/ui/elements/LoadingCard';

import { useEnvironment, useUserVerification } from '../../contexts';
import { useIsWebAuthnSupported } from '../../hooks';
import { localizationKeys } from '../../localization';
import { useRouter } from '../../router';
import { determineStartingSignInFactor, factorHasLocalStrategy, isResetPasswordStrategy } from '../SignIn/utils';
import { AlternativeMethods } from './AlternativeMethods';
import { useReverificationAlternativeStrategies } from './useReverificationAlternativeStrategies';
import type { PasswordErrorReason } from './UserVerificationFactorOnePassword';
import { UserVerificationFactorOnePasswordCard } from './UserVerificationFactorOnePassword';
import { useUserVerificationSession, withUserVerificationSessionGuard } from './useUserVerificationSession';
import { sortByPrimaryFactor } from './utils';
import { UVFactorOneEmailCodeCard } from './UVFactorOneEmailCodeCard';
import { UVFactorOnePasskeysCard } from './UVFactorOnePasskeysCard';
import { UVFactorOnePhoneCodeCard } from './UVFactorOnePhoneCodeCard';
import { UVFactorOneResetPasswordCodeCard } from './UVFactorOneResetPasswordCodeCard';
import { UVPasswordPwnedMethods } from './UVPasswordPwnedMethods';
import { UVResetPasswordCard } from './UVResetPasswordCard';

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

const SUPPORTED_STRATEGIES: SessionVerificationFirstFactor['strategy'][] = [
  'password',
  'email_code',
  'phone_code',
  'passkey',
] as const;

// Resetting a breached or compromised password: choose to reset, set the new
// password, then enter the code, which is sent together with the new password.
type ResetPasswordStep =
  | { step: 'none' }
  | { step: 'methods'; reason: PasswordErrorReason }
  | { step: 'newPassword'; reason: PasswordErrorReason; error?: Error }
  | { step: 'code'; reason: PasswordErrorReason };

export function UserVerificationFactorOneInternal(): JSX.Element | null {
  const { data } = useUserVerificationSession();
  const card = useCardState();
  const { navigate } = useRouter();

  const lastPreparedFactorKeyRef = React.useRef('');
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sessionVerification = data!;

  // A caller that already has the new password (UserProfile's change password)
  // passes it, so the user isn't asked for it again.
  const { resetPassword } = useUserVerification();
  const resetPasswordFactor = useMemo(
    () =>
      sessionVerification.supportedFirstFactors?.find(f => isResetPasswordStrategy(f.strategy)) as
        | ResetPasswordEmailCodeFactor
        | ResetPasswordPhoneCodeFactor
        | undefined,
    [sessionVerification.supportedFirstFactors],
  );
  const [resetStep, setResetStep] = React.useState<ResetPasswordStep>({ step: 'none' });
  const [newPassword, setNewPassword] = React.useState(
    () => resetPassword ?? { password: '', signOutOfOtherSessions: true },
  );

  const availableFactors = useMemo(() => {
    return (
      sessionVerification.supportedFirstFactors
        ?.filter(factor => SUPPORTED_STRATEGIES.includes(factor.strategy))
        ?.sort(sortByPrimaryFactor) || null
    );
  }, [sessionVerification.supportedFirstFactors]);
  const { preferredSignInStrategy } = useEnvironment().displayConfig;
  const webAuthnSupported = useIsWebAuthnSupported();

  const [{ currentFactor }, setFactor] = React.useState<{
    currentFactor: SignInFactor | undefined | null;
    prevCurrentFactor: SignInFactor | undefined | null;
  }>(() => ({
    currentFactor: determineStartingSignInFactor(availableFactors, null, preferredSignInStrategy, webAuthnSupported),
    prevCurrentFactor: undefined,
  }));

  const { hasAlternativeStrategies } = useReverificationAlternativeStrategies({
    filterOutFactor: currentFactor,
    supportedFirstFactors: availableFactors,
  });

  const [showAllStrategies, setShowAllStrategies] = React.useState<boolean>(
    () => !currentFactor || !factorHasLocalStrategy(currentFactor),
  );

  const toggleAllStrategies = hasAlternativeStrategies
    ? () => {
        card.setError(undefined);
        setShowAllStrategies(s => !s);
      }
    : undefined;

  const handleFactorPrepare = () => {
    lastPreparedFactorKeyRef.current = factorKey(currentFactor);
  };

  const selectFactor = (factor: SignInFactor) => {
    setFactor(prev => ({
      currentFactor: factor,
      prevCurrentFactor: prev.currentFactor,
    }));
  };

  useEffect(() => {
    if (sessionVerification.status === 'needs_second_factor') {
      void navigate('factor-two');
    }
  }, []);

  if (!currentFactor) {
    return (
      <ErrorCard
        cardTitle={localizationKeys('reverification.noAvailableMethods.title')}
        cardSubtitle={localizationKeys('reverification.noAvailableMethods.subtitle')}
        message={localizationKeys('reverification.noAvailableMethods.message')}
        shouldNavigateBack={false}
      />
    );
  }

  if (resetPasswordFactor && resetStep.step === 'methods') {
    const { reason } = resetStep;
    return (
      <UVPasswordPwnedMethods
        reason={reason}
        resetPasswordFactor={resetPasswordFactor}
        hasNewPassword={!!resetPassword}
        supportedFirstFactors={availableFactors}
        onResetPasswordClick={() =>
          setResetStep(resetPassword ? { step: 'code', reason } : { step: 'newPassword', reason })
        }
        onFactorSelected={f => {
          selectFactor(f);
          setResetStep({ step: 'none' });
        }}
        onBackLinkClick={() => {
          card.setError(undefined);
          setResetStep({ step: 'none' });
        }}
      />
    );
  }

  if (resetPasswordFactor && resetStep.step === 'newPassword') {
    const { reason, error } = resetStep;
    return (
      <UVResetPasswordCard
        initialPassword={newPassword.password}
        initialSignOutOfOtherSessions={newPassword.signOutOfOtherSessions}
        // The change password form already asked; its choice stands, and its success page reports it.
        showSignOutOfOtherSessions={!resetPassword}
        initialError={error}
        onSubmit={values => {
          setNewPassword(values);
          setResetStep({ step: 'code', reason });
        }}
        onBackLinkClick={() => setResetStep({ step: 'methods', reason })}
      />
    );
  }

  if (resetPasswordFactor && resetStep.step === 'code') {
    const { reason } = resetStep;
    return (
      <UVFactorOneResetPasswordCodeCard
        factor={resetPasswordFactor}
        factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(resetPasswordFactor)}
        onFactorPrepare={() => {
          lastPreparedFactorKeyRef.current = factorKey(resetPasswordFactor);
        }}
        newPassword={newPassword.password}
        signOutOfOtherSessions={newPassword.signOutOfOtherSessions}
        hasNewPassword={!!resetPassword}
        onNewPasswordRejected={error => setResetStep({ step: 'newPassword', reason, error })}
        onBackLinkClicked={() => {
          card.setError(undefined);
          setResetStep(resetPassword ? { step: 'methods', reason } : { step: 'newPassword', reason });
        }}
      />
    );
  }

  if (showAllStrategies) {
    const canGoBack = factorHasLocalStrategy(currentFactor);

    const toggle = toggleAllStrategies;
    const backHandler = () => {
      card.setError(undefined);
      toggle?.();
    };

    return (
      <AlternativeMethods
        onBackLinkClick={canGoBack ? backHandler : undefined}
        onFactorSelected={f => {
          selectFactor(f);
          toggle?.();
        }}
        currentFactor={currentFactor}
      />
    );
  }

  switch (currentFactor?.strategy) {
    case 'password':
      return (
        <UserVerificationFactorOnePasswordCard
          onShowAlternativeMethodsClick={toggleAllStrategies}
          onPasswordError={
            resetPasswordFactor
              ? reason => {
                  // The sign-in error asks the user to reset their password; with a
                  // new password already chosen, the screen's subtitle explains instead.
                  if (resetPassword) {
                    card.setError(undefined);
                  }
                  setResetStep({ step: 'methods', reason });
                }
              : undefined
          }
        />
      );
    case 'email_code':
      return (
        <UVFactorOneEmailCodeCard
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          factor={currentFactor}
          showAlternativeMethods={hasAlternativeStrategies}
        />
      );
    case 'phone_code':
      return (
        <UVFactorOnePhoneCodeCard
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          factor={currentFactor}
          showAlternativeMethods={hasAlternativeStrategies}
        />
      );
    case 'passkey':
      return <UVFactorOnePasskeysCard onShowAlternativeMethodsClicked={toggleAllStrategies} />;
    default:
      return <LoadingCard />;
  }
}

export const UserVerificationFactorOne = withUserVerificationSessionGuard(
  withCardStateProvider(UserVerificationFactorOneInternal),
);
