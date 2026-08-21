import type {
  ReverificationChallengeState,
  UserProfileDeleteAccountFlowState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import { useCallback, useRef, useState } from 'react';

import type { SecurityFlowConfig } from './user-profile-security-flow.config';

type DeleteSectionFlowConfig = Pick<
  SecurityFlowConfig,
  'failurePoint' | 'latencyMs' | 'requireReverification' | 'reverificationStrategy' | 'validCode' | 'validPassword'
>;

interface DeleteReverificationState {
  operation: 'delete-account';
  state: ReverificationChallengeState;
}

const CONFIRMATION = 'Delete account';
const IDLE_RESEND = { isResending: false, secondsRemaining: 0 };
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useDeleteSectionFlow({ config }: { config: DeleteSectionFlowConfig }) {
  const settingsRef = useRef(config);
  settingsRef.current = config;
  const [deleteAccount, setDeleteAccount] = useState<UserProfileDeleteAccountFlowState | null>(null);
  const [reverification, setReverification] = useState<DeleteReverificationState | null>(null);
  const verificationGate = useRef<{ resolve: (verified: boolean) => void } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const cancelReverification = useCallback(() => {
    verificationGate.current?.resolve(false);
    verificationGate.current = null;
    setReverification(null);
  }, []);
  const closeDeleteAccount = useCallback(() => {
    cancelReverification();
    setDeleteAccount(null);
  }, [cancelReverification]);
  const requestReverification = useCallback(() => {
    if (!settingsRef.current.requireReverification) {
      return Promise.resolve(true);
    }
    const strategy = settingsRef.current.reverificationStrategy;
    setReverification({
      operation: 'delete-account',
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

  const openDeleteAccount = useCallback(() => {
    const active = document.activeElement;
    triggerRef.current = active instanceof HTMLElement ? active : null;
    setDeleteAccount({ confirmation: '', isSubmitting: false, errors: {} });
  }, []);
  const updateDeleteConfirmation = useCallback((confirmation: string) => {
    setDeleteAccount(current => (current ? { ...current, confirmation, errors: {} } : current));
  }, []);
  const submitDeleteAccount = useCallback(() => {
    const current = deleteAccount;
    if (!current || current.isSubmitting || current.confirmation !== CONFIRMATION) {
      return;
    }
    setDeleteAccount(value => (value ? { ...value, isSubmitting: true, errors: {} } : value));
    void (async () => {
      await sleep(settingsRef.current.latencyMs);
      if (settingsRef.current.failurePoint === 'initial-request') {
        setDeleteAccount(value =>
          value
            ? { ...value, isSubmitting: false, errors: { form: 'Something went wrong. Please try again.' } }
            : value,
        );
        return;
      }
      const verified = await requestReverification();
      if (!verified) {
        setDeleteAccount(value => (value ? { ...value, isSubmitting: false } : value));
        return;
      }
      if (settingsRef.current.requireReverification) {
        await sleep(settingsRef.current.latencyMs);
        if (settingsRef.current.failurePoint === 'retried-mutation') {
          setDeleteAccount(value =>
            value
              ? { ...value, isSubmitting: false, errors: { form: 'Something went wrong. Please try again.' } }
              : value,
          );
          return;
        }
      }
      closeDeleteAccount();
    })();
  }, [closeDeleteAccount, deleteAccount, requestReverification]);

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
      const expected =
        current.state.strategy === 'password'
          ? settingsRef.current.validPassword
          : current.state.strategy === 'passkey'
            ? ''
            : settingsRef.current.validCode;
      if (
        settingsRef.current.failurePoint === 'reverification' ||
        (completedValue ?? current.state.value) !== expected
      ) {
        setReverification(value =>
          value
            ? {
                ...value,
                state: {
                  ...value.state,
                  value: '',
                  status: 'error',
                  errors:
                    settingsRef.current.failurePoint === 'reverification'
                      ? { form: 'Something went wrong. Please try again.' }
                      : {
                          field:
                            value.state.strategy === 'password'
                              ? 'Incorrect password.'
                              : 'Incorrect code. Please try again.',
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
    deleteAccount,
    reverification,
    openDeleteAccount,
    closeDeleteAccount,
    updateDeleteConfirmation,
    submitDeleteAccount,
    updateVerificationValue,
    submitVerification,
    resendReverification,
    cancelReverification,
  };
}
