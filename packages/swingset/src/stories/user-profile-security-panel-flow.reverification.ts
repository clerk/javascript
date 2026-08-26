import type {
  ReverificationChallengeState,
  UserProfileSecurityReverificationOperation,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import { useCallback, useRef, useState } from 'react';

import type { SecurityFlowConfig } from './user-profile-security-panel-flow.config';

type ReverificationFlowConfig = Pick<
  SecurityFlowConfig,
  'failurePoint' | 'latencyMs' | 'requireReverification' | 'reverificationStrategy' | 'validCode' | 'validPassword'
>;

export type SecurityReverificationOperation = UserProfileSecurityReverificationOperation;

interface SecurityReverificationState {
  operation: SecurityReverificationOperation;
  state: ReverificationChallengeState;
}

const IDLE_RESEND = { isResending: false, secondsRemaining: 0 };
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useSecurityReverificationFlow(config: ReverificationFlowConfig) {
  const settingsRef = useRef(config);
  settingsRef.current = config;
  const [reverification, setReverification] = useState<SecurityReverificationState | null>(null);
  const verificationGate = useRef<{
    operation: SecurityReverificationOperation;
    resolve: (verified: boolean) => void;
  } | null>(null);

  const cancelReverification = useCallback((operation?: SecurityReverificationOperation) => {
    if (operation && verificationGate.current?.operation !== operation) {
      return;
    }
    verificationGate.current?.resolve(false);
    verificationGate.current = null;
    setReverification(null);
  }, []);

  const requestReverification = useCallback((operation: SecurityReverificationOperation) => {
    if (!settingsRef.current.requireReverification) {
      return Promise.resolve(true);
    }
    verificationGate.current?.resolve(false);
    const strategy = settingsRef.current.reverificationStrategy;
    setReverification({
      operation,
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
      verificationGate.current = { operation, resolve };
    });
  }, []);

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
    reverification,
    requestReverification,
    cancelReverification,
    updateVerificationValue,
    submitVerification,
    resendReverification,
  };
}

export type SecurityReverificationFlow = ReturnType<typeof useSecurityReverificationFlow>;
