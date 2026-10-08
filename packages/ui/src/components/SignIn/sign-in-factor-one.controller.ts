import type { SignInFactor } from '@clerk/shared/types';
import React from 'react';

import { useCardState } from '@/ui/elements/contexts';

import type { AlternativeMethodsMode } from './AlternativeMethods';
import { hasMultipleEnterpriseConnections, SIGN_IN_RESET_PASSWORD_INTENT_PARAM } from './shared';
import type { useSignInFactorOneModel } from './sign-in-factor-one.model';
import type { PasswordErrorCode } from './SignInFactorOnePasswordCard';
import { determineStartingSignInFactor, factorHasLocalStrategy, isResetPasswordStrategy } from './utils';

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

function removeSignInResetPasswordIntentParam(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  if (url.searchParams.has(SIGN_IN_RESET_PASSWORD_INTENT_PARAM)) {
    url.searchParams.delete(SIGN_IN_RESET_PASSWORD_INTENT_PARAM);
    window.history.replaceState(window.history.state, '', url);
  }
}

export const useSignInFactorOneController = (model: ReturnType<typeof useSignInFactorOneModel>) => {
  const card = useCardState();
  const lastPreparedFactorKeyRef = React.useRef('');
  const [factorState, setFactorState] = React.useState<{
    currentFactor: SignInFactor | undefined | null;
    prevCurrentFactor: SignInFactor | undefined | null;
  }>(() => {
    const factor = determineStartingSignInFactor(
      model.supportedFirstFactors,
      model.identifier,
      model.preferredSignInStrategy,
    );
    if (
      factor?.strategy === 'phone_code' &&
      !!model.firstFactorVerificationChannel &&
      model.firstFactorVerificationChannel !== 'sms'
    ) {
      // This is only applied to phone_code with channel that is not 'sms'
      // because we don't want to send the channel parameter when its value is 'sms'
      factor.channel = model.firstFactorVerificationChannel;
    }
    return { currentFactor: factor, prevCurrentFactor: undefined };
  });
  const { currentFactor } = factorState;

  const hasAnyStrategy =
    (model.supportedFirstFactors?.filter(
      factor => factor.strategy !== currentFactor?.strategy && !isResetPasswordStrategy(factor.strategy),
    ).length || 0) +
      model.thirdPartyStrategyCount >
    0;

  // Frozen on mount: client-piggybacking may drop the field, which would otherwise unmount the
  // fallback screens mid-flow.
  const ssoBypassFactor = React.useRef(model.ssoBypassFactor).current;
  const [showAllStrategies, setShowAllStrategies] = React.useState<boolean>(() => {
    const defaultShow = !currentFactor || !factorHasLocalStrategy(currentFactor);
    return defaultShow || (model.resetPasswordIntent && !model.resetPasswordFactor);
  });
  const [showForgotPasswordStrategies, setShowForgotPasswordStrategies] = React.useState(
    () => model.resetPasswordIntent && !!model.resetPasswordFactor,
  );
  const [passwordErrorCode, setPasswordErrorCode] = React.useState<PasswordErrorCode | null>(null);
  const modelRef = React.useRef(model);
  modelRef.current = model;
  const { setActiveInProgress } = model;

  React.useEffect(() => {
    const currentModel = modelRef.current;
    if (setActiveInProgress) {
      return;
    }

    // Handle the case where a user lands on alternative methods screen,
    // clicks a social button but then navigates back to sign in.
    // SignIn status resets to 'needs_identifier'
    if (currentModel.status === 'needs_identifier' || currentModel.status === null) {
      void currentModel.navigateToStart();
    }
  }, [setActiveInProgress]);

  const toggleAllStrategies = hasAnyStrategy ? () => setShowAllStrategies(s => !s) : undefined;
  const toggleForgotPasswordStrategies = () => setShowForgotPasswordStrategies(s => !s);
  const handleFactorPrepare = () => {
    lastPreparedFactorKeyRef.current = factorKey(currentFactor);
  };
  const selectFactor = (factor: SignInFactor) => {
    setFactorState(prev => ({ currentFactor: factor, prevCurrentFactor: prev.currentFactor }));
  };
  const toggle = showAllStrategies ? toggleAllStrategies : toggleForgotPasswordStrategies;
  const leaveAlternativeMethods = () => {
    // This search param only exists if the user clicked "Forgot password?" on the
    // start page, it's a way to go directly to the password reset screen.
    // If it does exist, we want to remove it on exit so refresh works correctly after.
    removeSignInResetPasswordIntentParam();
    toggle?.();
  };
  const backHandler: React.MouseEventHandler<Element> = () => {
    card.setError(undefined);
    setPasswordErrorCode(null);
    leaveAlternativeMethods();
  };

  return {
    currentFactor,
    status: model.status,
    ssoBypassFactor,
    hasMultipleEnterpriseConnections: hasMultipleEnterpriseConnections(model.supportedFirstFactors),
    showAlternativeMethods: showAllStrategies || showForgotPasswordStrategies,
    alternativeMethodsMode: determineAlternativeMethodsMode(showForgotPasswordStrategies, passwordErrorCode),
    canGoBack: factorHasLocalStrategy(currentFactor) && !passwordErrorCode,
    onAlternativeMethodsBack: backHandler,
    onAlternativeFactorSelected: (factor: SignInFactor) => {
      selectFactor(factor);
      leaveAlternativeMethods();
    },
    factorAlreadyPrepared: lastPreparedFactorKeyRef.current === factorKey(currentFactor),
    onFactorPrepare: handleFactorPrepare,
    onShowAlternativeMethods: toggleAllStrategies,
    onForgotPasswordMethod: model.resetPasswordFactor ? toggleForgotPasswordStrategies : toggleAllStrategies,
    onPasswordError: (errorCode: PasswordErrorCode) => {
      setPasswordErrorCode(errorCode);
      toggleForgotPasswordStrategies();
    },
    onChangePhoneCodeChannel: selectFactor,
    onResetPasswordBack: () => {
      setFactorState(prev => ({ currentFactor: prev.prevCurrentFactor, prevCurrentFactor: prev.currentFactor }));
      toggleForgotPasswordStrategies();
    },
  };
};
