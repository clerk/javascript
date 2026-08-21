import type {
  ReverificationChallengeState,
  UserProfilePasswordField,
  UserProfilePasswordFlowState,
  UserProfilePasswordValues,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { SecurityFlowConfig } from './user-profile-security-flow.config';

type PasswordSectionFlowConfig = Pick<
  SecurityFlowConfig,
  | 'failurePoint'
  | 'hasPassword'
  | 'latencyMs'
  | 'passwordReadOnly'
  | 'passwordMinimumLength'
  | 'requireReverification'
  | 'signedInIdentifier'
  | 'reverificationStrategy'
  | 'validCode'
  | 'validPassword'
>;

interface PasswordReverificationState {
  operation: 'password';
  state: ReverificationChallengeState;
}

const EMPTY_PASSWORD_VALUES: UserProfilePasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: true,
};

const IDLE_RESEND = { isResending: false, secondsRemaining: 0 };
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function usePasswordSectionFlow({
  config,
  onHasPasswordChange,
  onSignOutOtherSessions,
}: {
  config: PasswordSectionFlowConfig;
  onHasPasswordChange?: (hasPassword: boolean) => void;
  onSignOutOtherSessions?: () => void;
}) {
  const settingsRef = useRef(config);
  settingsRef.current = config;
  const [hasPassword, setHasPassword] = useState(config.hasPassword);
  const [password, setPassword] = useState<UserProfilePasswordFlowState | null>(null);
  const [reverification, setReverification] = useState<PasswordReverificationState | null>(null);
  const verificationGate = useRef<{ resolve: (verified: boolean) => void } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => setHasPassword(config.hasPassword), [config.hasPassword]);

  const cancelReverification = useCallback(() => {
    verificationGate.current?.resolve(false);
    verificationGate.current = null;
    setReverification(null);
  }, []);

  const closePassword = useCallback(() => {
    cancelReverification();
    setPassword(null);
  }, [cancelReverification]);

  const requestReverification = useCallback(() => {
    if (!settingsRef.current.requireReverification) {
      return Promise.resolve(true);
    }
    const strategy = settingsRef.current.reverificationStrategy;
    setReverification({
      operation: 'password',
      state: {
        strategy,
        identifier:
          strategy === 'email_code' ? 'i••••@clerk.dev' : strategy === 'phone_code' ? '+1 ••• ••• 4242' : undefined,
        value: '',
        status: 'idle',
        errors: {},
        resend: IDLE_RESEND,
      },
    });
    return new Promise<boolean>(resolve => {
      verificationGate.current = { resolve };
    });
  }, []);

  const openPassword = useCallback(() => {
    const active = document.activeElement;
    triggerRef.current = active instanceof HTMLElement ? active : null;
    setPassword({
      mode: hasPassword ? 'change' : 'set',
      values: EMPTY_PASSWORD_VALUES,
      requiresCurrentPassword: hasPassword && !config.requireReverification,
      signedInIdentifier: config.signedInIdentifier,
      minimumLength: config.passwordMinimumLength,
      isReadOnly: config.passwordReadOnly,
      isSubmitting: false,
      errors: {},
    });
  }, [
    config.passwordMinimumLength,
    config.passwordReadOnly,
    config.requireReverification,
    config.signedInIdentifier,
    hasPassword,
  ]);

  const updatePasswordValue = useCallback(
    <Field extends UserProfilePasswordField>(field: Field, value: UserProfilePasswordValues[Field]) => {
      setPassword(current =>
        current ? { ...current, values: { ...current.values, [field]: value }, errors: {} } : current,
      );
    },
    [],
  );

  const submitPassword = useCallback(() => {
    const current = password;
    if (!current || current.isReadOnly || current.isSubmitting) {
      return;
    }
    if (current.requiresCurrentPassword && !current.values.currentPassword) {
      setPassword(state => (state ? { ...state, errors: { currentPassword: 'Enter your current password.' } } : state));
      return;
    }
    if (current.values.newPassword.length < (current.minimumLength ?? 1)) {
      setPassword(state =>
        state
          ? {
              ...state,
              errors: { newPassword: `Your password must contain ${current.minimumLength} or more characters.` },
            }
          : state,
      );
      return;
    }
    if (current.values.newPassword !== current.values.confirmPassword) {
      setPassword(state => (state ? { ...state, errors: { confirmPassword: 'Passwords do not match.' } } : state));
      return;
    }

    setPassword(state => (state ? { ...state, isSubmitting: true, errors: {} } : state));
    void (async () => {
      await sleep(settingsRef.current.latencyMs);
      if (settingsRef.current.failurePoint === 'initial-request') {
        setPassword(state =>
          state
            ? { ...state, isSubmitting: false, errors: { form: 'Something went wrong. Please try again.' } }
            : state,
        );
        return;
      }
      const verified = await requestReverification();
      if (!verified) {
        setPassword(state => (state ? { ...state, isSubmitting: false } : state));
        return;
      }
      if (settingsRef.current.requireReverification) {
        await sleep(settingsRef.current.latencyMs);
        if (settingsRef.current.failurePoint === 'retried-mutation') {
          setPassword(state =>
            state
              ? { ...state, isSubmitting: false, errors: { form: 'Something went wrong. Please try again.' } }
              : state,
          );
          return;
        }
      }
      setHasPassword(true);
      onHasPasswordChange?.(true);
      if (current.values.signOutOfOtherSessions) {
        onSignOutOtherSessions?.();
      }
      closePassword();
    })();
  }, [closePassword, onHasPasswordChange, onSignOutOtherSessions, password, requestReverification]);

  const updateVerificationValue = useCallback((value: string) => {
    setReverification(current =>
      current ? { ...current, state: { ...current.state, value, status: 'idle', errors: {} } } : current,
    );
  }, []);

  const submitVerification = useCallback(
    async (completedValue?: string) => {
      const current = reverification;
      if (!current) {
        return;
      }
      setReverification(value =>
        value ? { ...value, state: { ...value.state, status: 'verifying', errors: {} } } : value,
      );
      await sleep(settingsRef.current.latencyMs);
      if (settingsRef.current.failurePoint === 'reverification') {
        setReverification(value =>
          value
            ? {
                ...value,
                state: { ...value.state, status: 'error', errors: { form: 'Something went wrong. Please try again.' } },
              }
            : value,
        );
        return;
      }
      const expected =
        current.state.strategy === 'password'
          ? settingsRef.current.validPassword
          : current.state.strategy === 'passkey'
            ? ''
            : settingsRef.current.validCode;
      if ((completedValue ?? current.state.value) !== expected) {
        setReverification(value =>
          value
            ? {
                ...value,
                state: {
                  ...value.state,
                  value: '',
                  status: 'error',
                  errors: {
                    field:
                      value.state.strategy === 'password' ? 'Incorrect password.' : 'Incorrect code. Please try again.',
                  },
                },
              }
            : value,
        );
        return;
      }
      const gate = verificationGate.current;
      verificationGate.current = null;
      setReverification(null);
      gate?.resolve(true);
    },
    [reverification],
  );

  const resendReverification = useCallback(async () => {
    setReverification(current =>
      current
        ? { ...current, state: { ...current.state, resend: { ...current.state.resend, isResending: true } } }
        : current,
    );
    await sleep(settingsRef.current.latencyMs);
    setReverification(current =>
      current
        ? { ...current, state: { ...current.state, resend: { ...current.state.resend, isResending: false } } }
        : current,
    );
  }, []);

  return {
    triggerRef,
    hasPassword,
    password,
    reverification,
    openPassword,
    closePassword,
    updatePasswordValue,
    submitPassword,
    updateVerificationValue,
    submitVerification,
    resendReverification,
    cancelReverification,
  };
}
