import type {
  ReverificationChallengeState,
  UserProfilePasskeyAddFlowState,
  UserProfilePasskeyRemoveFlowState,
  UserProfilePasskeyRenameFlowState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import type { UserProfilePasskey } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { SecurityFlowConfig } from './user-profile-security-panel-flow.config';

type PasskeysFlowSliceConfig = Pick<
  SecurityFlowConfig,
  | 'failurePoint'
  | 'hasPasskey'
  | 'latencyMs'
  | 'passkeyCapability'
  | 'passkeyCreationResult'
  | 'requireReverification'
  | 'reverificationStrategy'
  | 'validCode'
  | 'validPassword'
>;
type PasskeyOperation = 'add-passkey' | 'rename-passkey' | 'remove-passkey';

interface PasskeyReverificationState {
  operation: PasskeyOperation;
  state: ReverificationChallengeState;
}

const IDLE_RESEND = { isResending: false, secondsRemaining: 0 };
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function usePasskeysFlowSlice({
  config,
  onHasPasskeyChange,
}: {
  config: PasskeysFlowSliceConfig;
  onHasPasskeyChange?: (hasPasskey: boolean) => void;
}) {
  const settingsRef = useRef(config);
  settingsRef.current = config;
  const [passkeys, setPasskeys] = useState<UserProfilePasskey[]>(() => passkeysFromConfig(config.hasPasskey));
  const [addPasskey, setAddPasskey] = useState<UserProfilePasskeyAddFlowState | null>(null);
  const [renamePasskey, setRenamePasskey] = useState<UserProfilePasskeyRenameFlowState | null>(null);
  const [removePasskey, setRemovePasskey] = useState<UserProfilePasskeyRemoveFlowState | null>(null);
  const [reverification, setReverification] = useState<PasskeyReverificationState | null>(null);
  const verificationGate = useRef<{ operation: PasskeyOperation; resolve: (verified: boolean) => void } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const captureTrigger = useCallback(() => {
    const active = document.activeElement;
    triggerRef.current = active instanceof HTMLElement ? active : null;
  }, []);

  useEffect(() => setPasskeys(current => passkeysFromConfig(config.hasPasskey, current)), [config.hasPasskey]);

  const cancelReverification = useCallback(() => {
    verificationGate.current?.resolve(false);
    verificationGate.current = null;
    setReverification(null);
  }, []);

  const closeOperation = useCallback(
    (operation: PasskeyOperation) => {
      if (verificationGate.current?.operation === operation) {
        cancelReverification();
      }
      if (operation === 'add-passkey') {
        setAddPasskey(null);
      } else if (operation === 'rename-passkey') {
        setRenamePasskey(null);
      } else {
        setRemovePasskey(null);
      }
    },
    [cancelReverification],
  );

  const setSubmitting = useCallback((operation: PasskeyOperation, isSubmitting: boolean, formError?: string) => {
    const errors = formError ? { form: formError } : {};
    if (operation === 'add-passkey') {
      setAddPasskey(current => (current ? { ...current, isSubmitting, errors } : current));
    } else if (operation === 'rename-passkey') {
      setRenamePasskey(current => (current ? { ...current, isSubmitting, errors } : current));
    } else {
      setRemovePasskey(current => (current ? { ...current, isSubmitting, errors } : current));
    }
  }, []);

  const requestReverification = useCallback((operation: PasskeyOperation) => {
    if (!settingsRef.current.requireReverification || operation === 'rename-passkey') {
      return Promise.resolve(true);
    }
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

  const runMutation = useCallback(
    async (operation: PasskeyOperation, onSuccess: () => void) => {
      setSubmitting(operation, true);
      await sleep(settingsRef.current.latencyMs);
      if (settingsRef.current.failurePoint === 'initial-request') {
        setSubmitting(operation, false, 'Something went wrong. Please try again.');
        return;
      }
      const verified = await requestReverification(operation);
      if (!verified) {
        setSubmitting(operation, false);
        return;
      }
      if (settingsRef.current.requireReverification && operation !== 'rename-passkey') {
        await sleep(settingsRef.current.latencyMs);
        if (settingsRef.current.failurePoint === 'retried-mutation') {
          setSubmitting(operation, false, 'Something went wrong. Please try again.');
          return;
        }
      }
      onSuccess();
    },
    [requestReverification, setSubmitting],
  );

  const openAddPasskey = useCallback(() => {
    captureTrigger();
    const capability = settingsRef.current.passkeyCapability;
    setAddPasskey({
      capability,
      result: 'idle',
      isSubmitting: false,
      errors: capability === 'unsupported' ? { form: 'Passkeys are not supported by this browser or device.' } : {},
    });
  }, [captureTrigger]);
  const submitAddPasskey = useCallback(() => {
    void runMutation('add-passkey', () => {
      const result = settingsRef.current.passkeyCreationResult;
      if (result !== 'success') {
        setAddPasskey(current =>
          current
            ? {
                ...current,
                result,
                isSubmitting: false,
                errors: {
                  form:
                    result === 'cancelled'
                      ? 'Passkey creation was cancelled.'
                      : 'The passkey could not be created. Please try again.',
                },
              }
            : current,
        );
        return;
      }
      setPasskeys(current => [
        ...current,
        { id: `passkey-${Date.now()}`, name: `Passkey ${current.length + 1}`, createdAtLabel: 'Created just now' },
      ]);
      onHasPasskeyChange?.(true);
      closeOperation('add-passkey');
    });
  }, [closeOperation, onHasPasskeyChange, runMutation]);

  const openRenamePasskey = useCallback(
    (id: string) => {
      captureTrigger();
      const passkey = passkeys.find(candidate => candidate.id === id);
      if (passkey) {
        setRenamePasskey({ id, originalName: passkey.name, name: passkey.name, isSubmitting: false, errors: {} });
      }
    },
    [captureTrigger, passkeys],
  );
  const submitRenamePasskey = useCallback(() => {
    if (!renamePasskey || renamePasskey.name.length < 2 || renamePasskey.name === renamePasskey.originalName) {
      return;
    }
    const { id, name } = renamePasskey;
    void runMutation('rename-passkey', () => {
      setPasskeys(current => current.map(passkey => (passkey.id === id ? { ...passkey, name } : passkey)));
      closeOperation('rename-passkey');
    });
  }, [closeOperation, renamePasskey, runMutation]);

  const openRemovePasskey = useCallback(
    (id: string) => {
      captureTrigger();
      const passkey = passkeys.find(candidate => candidate.id === id);
      if (passkey) {
        setRemovePasskey({ id, name: passkey.name, isSubmitting: false, errors: {} });
      }
    },
    [captureTrigger, passkeys],
  );
  const submitRemovePasskey = useCallback(() => {
    if (!removePasskey) {
      return;
    }
    const { id } = removePasskey;
    void runMutation('remove-passkey', () => {
      setPasskeys(current => {
        const next = current.filter(passkey => passkey.id !== id);
        onHasPasskeyChange?.(next.length > 0);
        return next;
      });
      closeOperation('remove-passkey');
    });
  }, [closeOperation, onHasPasskeyChange, removePasskey, runMutation]);

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
    passkeys,
    addPasskey,
    renamePasskey,
    removePasskey,
    reverification,
    openAddPasskey,
    closeAddPasskey: () => {
      if (!addPasskey?.isSubmitting) {
        closeOperation('add-passkey');
      }
    },
    submitAddPasskey,
    openRenamePasskey,
    closeRenamePasskey: () => {
      if (!renamePasskey?.isSubmitting) {
        closeOperation('rename-passkey');
      }
    },
    updatePasskeyName: (name: string) =>
      setRenamePasskey(current => (current ? { ...current, name, errors: {} } : current)),
    submitRenamePasskey,
    openRemovePasskey,
    closeRemovePasskey: () => {
      if (!removePasskey?.isSubmitting) {
        closeOperation('remove-passkey');
      }
    },
    submitRemovePasskey,
    updateVerificationValue,
    submitVerification,
    resendReverification,
    cancelReverification,
  };
}

function passkeysFromConfig(hasPasskey: boolean, current: UserProfilePasskey[] = []) {
  if (!hasPasskey) {
    return [];
  }
  return current.length > 0
    ? current
    : [
        {
          id: 'passkey',
          name: 'Passkey',
          createdAtLabel: 'Created today at 10:12 PM',
          lastUsedAtLabel: 'Last used 1h ago',
        },
      ];
}
