import type {
  UserProfilePasswordField,
  UserProfilePasswordFlowState,
  UserProfilePasswordValues,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { SecurityFlowConfig } from './user-profile-security-panel-flow.config';
import type { SecurityReverificationFlow } from './user-profile-security-panel-flow.reverification';

type PasswordFlowSliceConfig = Pick<
  SecurityFlowConfig,
  | 'failurePoint'
  | 'hasPassword'
  | 'latencyMs'
  | 'passwordReadOnly'
  | 'passwordMinimumLength'
  | 'requireReverification'
  | 'signedInIdentifier'
>;

const EMPTY_PASSWORD_VALUES: UserProfilePasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: true,
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function usePasswordFlowSlice({
  config,
  reverificationFlow,
  onHasPasswordChange,
  onSignOutOtherSessions,
}: {
  config: PasswordFlowSliceConfig;
  reverificationFlow: SecurityReverificationFlow;
  onHasPasswordChange?: (hasPassword: boolean) => void;
  onSignOutOtherSessions?: () => void;
}) {
  const settingsRef = useRef(config);
  settingsRef.current = config;
  const [hasPassword, setHasPassword] = useState(config.hasPassword);
  const [password, setPassword] = useState<UserProfilePasswordFlowState | null>(null);
  const submissionPending = useRef(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => setHasPassword(config.hasPassword), [config.hasPassword]);

  const closePassword = useCallback(() => {
    reverificationFlow.cancelReverification('password');
    setPassword(null);
  }, [reverificationFlow]);

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
    if (!current || current.isReadOnly || current.isSubmitting || submissionPending.current) {
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

    submissionPending.current = true;
    setPassword(state => (state ? { ...state, isSubmitting: true, errors: {} } : state));
    void (async () => {
      try {
        await sleep(settingsRef.current.latencyMs);
        if (settingsRef.current.failurePoint === 'initial-request') {
          setPassword(state =>
            state
              ? { ...state, isSubmitting: false, errors: { form: 'Something went wrong. Please try again.' } }
              : state,
          );
          return;
        }
        const verified = await reverificationFlow.requestReverification('password');
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
      } finally {
        submissionPending.current = false;
      }
    })();
  }, [closePassword, onHasPasswordChange, onSignOutOtherSessions, password, reverificationFlow]);

  return {
    triggerRef,
    hasPassword,
    password,
    openPassword,
    closePassword: () => {
      if (!password?.isSubmitting) {
        closePassword();
      }
    },
    updatePasswordValue,
    submitPassword,
  };
}
