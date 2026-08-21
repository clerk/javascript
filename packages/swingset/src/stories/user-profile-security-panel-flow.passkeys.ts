import type {
  UserProfilePasskeyCreationState,
  UserProfilePasskeyRemoveFlowState,
  UserProfilePasskeyRenameFlowState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import type { UserProfilePasskey } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { SecurityFlowConfig } from './user-profile-security-panel-flow.config';
import type { SecurityReverificationFlow } from './user-profile-security-panel-flow.reverification';

type PasskeysFlowSliceConfig = Pick<
  SecurityFlowConfig,
  'failurePoint' | 'hasPasskey' | 'latencyMs' | 'passkeyCapability' | 'passkeyCreationResult' | 'requireReverification'
>;
type PasskeyOperation = 'add-passkey' | 'rename-passkey' | 'remove-passkey';
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function usePasskeysFlowSlice({
  config,
  reverificationFlow,
  onHasPasskeyChange,
}: {
  config: PasskeysFlowSliceConfig;
  reverificationFlow: SecurityReverificationFlow;
  onHasPasskeyChange?: (hasPasskey: boolean) => void;
}) {
  const settingsRef = useRef(config);
  settingsRef.current = config;
  const [passkeys, setPasskeys] = useState<UserProfilePasskey[]>(() => passkeysFromConfig(config.hasPasskey));
  const [passkeyCreation, setPasskeyCreation] = useState<UserProfilePasskeyCreationState | null>(null);
  const [renamePasskey, setRenamePasskey] = useState<UserProfilePasskeyRenameFlowState | null>(null);
  const [removePasskey, setRemovePasskey] = useState<UserProfilePasskeyRemoveFlowState | null>(null);
  const pendingOperations = useRef(new Set<PasskeyOperation>());
  const triggerRef = useRef<HTMLElement | null>(null);
  const captureTrigger = useCallback(() => {
    const active = document.activeElement;
    triggerRef.current = active instanceof HTMLElement ? active : null;
  }, []);

  useEffect(() => setPasskeys(current => passkeysFromConfig(config.hasPasskey, current)), [config.hasPasskey]);

  const closeOperation = useCallback(
    (operation: PasskeyOperation) => {
      if (operation !== 'rename-passkey') {
        reverificationFlow.cancelReverification(operation);
      }
      if (operation === 'add-passkey') {
        setPasskeyCreation(null);
      } else if (operation === 'rename-passkey') {
        setRenamePasskey(null);
      } else {
        setRemovePasskey(null);
      }
    },
    [reverificationFlow],
  );

  const setSubmitting = useCallback((operation: PasskeyOperation, isSubmitting: boolean, formError?: string) => {
    const errors = formError ? { form: formError } : {};
    if (operation === 'add-passkey') {
      setPasskeyCreation(current => (current ? { ...current, isSubmitting, errors } : current));
    } else if (operation === 'rename-passkey') {
      setRenamePasskey(current => (current ? { ...current, isSubmitting, errors } : current));
    } else {
      setRemovePasskey(current => (current ? { ...current, isSubmitting, errors } : current));
    }
  }, []);

  const runMutation = useCallback(
    async (operation: PasskeyOperation, onSuccess: () => void) => {
      if (pendingOperations.current.has(operation)) {
        return;
      }
      pendingOperations.current.add(operation);
      try {
        setSubmitting(operation, true);
        await sleep(settingsRef.current.latencyMs);
        if (settingsRef.current.failurePoint === 'initial-request') {
          setSubmitting(operation, false, 'Something went wrong. Please try again.');
          return;
        }
        const verified =
          operation === 'rename-passkey' ? true : await reverificationFlow.requestReverification(operation);
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
      } finally {
        pendingOperations.current.delete(operation);
      }
    },
    [reverificationFlow, setSubmitting],
  );

  const addPasskey = useCallback(() => {
    if (pendingOperations.current.has('add-passkey')) {
      return;
    }
    captureTrigger();
    const capability = settingsRef.current.passkeyCapability;
    setPasskeyCreation({
      capability,
      result: 'idle',
      isSubmitting: false,
      errors: capability === 'unsupported' ? { form: 'Passkeys are not supported by this browser or device.' } : {},
    });
    if (capability === 'unsupported') {
      return;
    }
    void runMutation('add-passkey', () => {
      const result = settingsRef.current.passkeyCreationResult;
      if (result !== 'success') {
        setPasskeyCreation(current =>
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
  }, [captureTrigger, closeOperation, onHasPasskeyChange, runMutation]);

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
    if (
      !renamePasskey ||
      renamePasskey.isSubmitting ||
      pendingOperations.current.has('rename-passkey') ||
      renamePasskey.name.length < 2 ||
      renamePasskey.name === renamePasskey.originalName
    ) {
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
    if (!removePasskey || removePasskey.isSubmitting || pendingOperations.current.has('remove-passkey')) {
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

  return {
    triggerRef,
    passkeys,
    passkeyCreation,
    renamePasskey,
    removePasskey,
    addPasskey,
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
