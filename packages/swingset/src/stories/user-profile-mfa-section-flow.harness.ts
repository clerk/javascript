import type {
  ReverificationChallengeState,
  UserProfileBackupCodesFlowState,
  UserProfileMfaAddFlowState,
  UserProfileMfaMethodType,
  UserProfileMfaRemoveFlowState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import type { UserProfileMfaMethod } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { SecurityFlowConfig } from './user-profile-security-flow.config';

type MfaSectionFlowConfig = Pick<
  SecurityFlowConfig,
  | 'availableMfaPhone'
  | 'backupCodesAvailable'
  | 'failurePoint'
  | 'hasBackupCodes'
  | 'hasMfaAuthenticator'
  | 'hasMfaPhone'
  | 'latencyMs'
  | 'mfaRequired'
  | 'requireReverification'
  | 'reverificationStrategy'
  | 'validCode'
  | 'validPassword'
>;
type MfaOperation = 'add-mfa' | 'remove-mfa' | 'backup-codes';

interface MfaReverificationState {
  operation: MfaOperation;
  state: ReverificationChallengeState;
}

const IDLE_RESEND = { isResending: false, secondsRemaining: 0 };
const GENERATED_BACKUP_CODES = [
  '3k4p-7m2q',
  '9w6d-2x8n',
  '5t1r-8c4v',
  '7j3f-6h9s',
  '2b8m-4q1k',
  '6n5x-9p3d',
  '4v7t-1r8c',
  '8s2j-5f6h',
];
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useMfaSectionFlow({
  config,
  onMfaMethodChange,
  onBackupCodesChange,
}: {
  config: MfaSectionFlowConfig;
  onMfaMethodChange?: (method: UserProfileMfaMethodType, enabled: boolean) => void;
  onBackupCodesChange?: (enabled: boolean) => void;
}) {
  const settingsRef = useRef(config);
  settingsRef.current = config;
  const [mfaMethods, setMfaMethods] = useState<UserProfileMfaMethod[]>(() =>
    methodsFromConfig(config.hasMfaPhone, config.hasMfaAuthenticator, config.hasBackupCodes, config.mfaRequired),
  );
  const [addMfa, setAddMfa] = useState<UserProfileMfaAddFlowState | null>(null);
  const [removeMfa, setRemoveMfa] = useState<UserProfileMfaRemoveFlowState | null>(null);
  const [backupCodes, setBackupCodes] = useState<UserProfileBackupCodesFlowState | null>(null);
  const [reverification, setReverification] = useState<MfaReverificationState | null>(null);
  const verificationGate = useRef<{ operation: MfaOperation; resolve: (verified: boolean) => void } | null>(null);

  useEffect(
    () =>
      setMfaMethods(current =>
        methodsFromConfig(
          config.hasMfaPhone,
          config.hasMfaAuthenticator,
          config.hasBackupCodes,
          config.mfaRequired,
          current,
        ),
      ),
    [config.hasBackupCodes, config.hasMfaAuthenticator, config.hasMfaPhone, config.mfaRequired],
  );

  const cancelReverification = useCallback(() => {
    verificationGate.current?.resolve(false);
    verificationGate.current = null;
    setReverification(null);
  }, []);
  const closeOperation = useCallback(
    (operation: MfaOperation) => {
      if (verificationGate.current?.operation === operation) {
        cancelReverification();
      }
      if (operation === 'add-mfa') {
        setAddMfa(null);
      } else if (operation === 'remove-mfa') {
        setRemoveMfa(null);
      } else {
        setBackupCodes(null);
      }
    },
    [cancelReverification],
  );
  const setSubmitting = useCallback((operation: MfaOperation, isSubmitting: boolean, formError?: string) => {
    const errors = formError ? { form: formError } : {};
    if (operation === 'add-mfa') {
      setAddMfa(current =>
        current
          ? {
              ...current,
              isSubmitting,
              ...(current.step === 'verify' && formError ? { status: 'error' as const } : {}),
              errors,
            }
          : current,
      );
    } else if (operation === 'remove-mfa') {
      setRemoveMfa(current => (current ? { ...current, isSubmitting, errors } : current));
    } else {
      setBackupCodes(current => (current ? { step: 'generating', isSubmitting, errors } : current));
    }
  }, []);
  const requestReverification = useCallback((operation: MfaOperation) => {
    if (!settingsRef.current.requireReverification) {
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
    async (operation: MfaOperation, onSuccess: () => void) => {
      setSubmitting(operation, true);
      await sleep(settingsRef.current.latencyMs);
      if (settingsRef.current.failurePoint === 'initial-request') {
        setSubmitting(operation, false, 'Something went wrong. Please try again.');
        return;
      }
      const verified = await requestReverification(operation);
      if (!verified) {
        setSubmitting(operation, false);
        if (operation === 'backup-codes') {
          closeOperation(operation);
        }
        return;
      }
      if (settingsRef.current.requireReverification) {
        await sleep(settingsRef.current.latencyMs);
        if (settingsRef.current.failurePoint === 'retried-mutation') {
          setSubmitting(operation, false, 'Something went wrong. Please try again.');
          return;
        }
      }
      onSuccess();
    },
    [closeOperation, requestReverification, setSubmitting],
  );

  const completeMfaEnrollment = useCallback(
    (method: UserProfileMfaMethodType, identifier?: string) => {
      const nextMethod: UserProfileMfaMethod =
        method === 'sms'
          ? { id: `sms-${Date.now()}`, type: 'sms', description: identifier }
          : { id: 'authenticator', type: 'authenticator' };
      setMfaMethods(methods =>
        withMfaRemovalConstraints(
          [
            ...methods.filter(candidate =>
              method === 'sms'
                ? candidate.type !== 'backup-codes'
                : candidate.type !== method && candidate.type !== 'backup-codes',
            ),
            nextMethod,
            ...(settingsRef.current.backupCodesAvailable
              ? [{ id: 'backup-codes', type: 'backup-codes' as const }]
              : methods.filter(candidate => candidate.type === 'backup-codes')),
          ],
          settingsRef.current.mfaRequired,
        ),
      );
      onMfaMethodChange?.(method, true);
      if (settingsRef.current.backupCodesAvailable) {
        onBackupCodesChange?.(true);
        setAddMfa({
          method,
          step: 'backup-codes',
          codes: GENERATED_BACKUP_CODES,
          copied: false,
          isSubmitting: false,
          errors: {},
        });
      } else if (method === 'authenticator') {
        setAddMfa({ method, step: 'success', isSubmitting: false, errors: {} });
      } else {
        closeOperation('add-mfa');
      }
    },
    [closeOperation, onBackupCodesChange, onMfaMethodChange],
  );
  const prepareAuthenticator = useCallback(() => {
    setAddMfa({ method: 'authenticator', step: 'preparing', isSubmitting: true, errors: {} });
    void runMutation('add-mfa', () =>
      setAddMfa({
        method: 'authenticator',
        step: 'setup',
        displayFormat: 'qr',
        secret: 'JBSWY3DPEHPK3PXP',
        isSubmitting: false,
        errors: {},
      }),
    );
  }, [runMutation]);
  const openAddMfa = useCallback(
    (method: UserProfileMfaMethodType) => {
      if (method === 'authenticator') {
        prepareAuthenticator();
      } else if (settingsRef.current.availableMfaPhone !== 'none') {
        setAddMfa({
          method: 'sms',
          step: 'select-phone',
          phones: [
            {
              id: 'existing-phone',
              label: '+1 801-888-8181',
              isVerified: settingsRef.current.availableMfaPhone === 'verified',
            },
          ],
          isSubmitting: false,
          errors: {},
        });
      } else {
        setAddMfa({ method: 'sms', step: 'phone', phoneNumber: '+1', isSubmitting: false, errors: {} });
      }
    },
    [prepareAuthenticator],
  );
  const selectMfaPhone = useCallback(
    (id: string) => {
      if (!addMfa || addMfa.step !== 'select-phone') {
        return;
      }
      const phone = addMfa.phones.find(candidate => candidate.id === id);
      if (!phone) {
        return;
      }
      if (!phone.isVerified) {
        setAddMfa({
          method: 'sms',
          step: 'verify',
          identifier: phone.label,
          code: '',
          status: 'idle',
          resend: IDLE_RESEND,
          isSubmitting: false,
          errors: {},
        });
        return;
      }
      setAddMfa(current =>
        current?.step === 'select-phone' ? { ...current, loadingPhoneId: id, isSubmitting: true, errors: {} } : current,
      );
      void runMutation('add-mfa', () => completeMfaEnrollment('sms', phone.label));
    },
    [addMfa, completeMfaEnrollment, runMutation],
  );
  const submitAddMfa = useCallback(
    async (completedCode?: string) => {
      const current = addMfa;
      if (!current || current.isSubmitting) {
        return;
      }
      if (current.step === 'preparing') {
        prepareAuthenticator();
      } else if (current.step === 'phone') {
        setAddMfa({ ...current, isSubmitting: true, errors: {} });
        await sleep(settingsRef.current.latencyMs);
        setAddMfa({
          method: 'sms',
          step: 'verify',
          identifier: current.phoneNumber,
          code: '',
          status: 'idle',
          resend: IDLE_RESEND,
          isSubmitting: false,
          errors: {},
        });
      } else if (current.step === 'setup') {
        setAddMfa({
          method: 'authenticator',
          step: 'verify',
          code: '',
          status: 'idle',
          resend: IDLE_RESEND,
          isSubmitting: false,
          errors: {},
        });
      } else if (current.step === 'verify') {
        setAddMfa(value => (value?.step === 'verify' ? { ...value, status: 'verifying', errors: {} } : value));
        await sleep(settingsRef.current.latencyMs);
        if ((completedCode ?? current.code) !== settingsRef.current.validCode) {
          setAddMfa(value =>
            value?.step === 'verify'
              ? { ...value, code: '', status: 'error', errors: { field: 'Incorrect code. Please try again.' } }
              : value,
          );
        } else if (current.method === 'sms') {
          void runMutation('add-mfa', () => completeMfaEnrollment('sms', current.identifier));
        } else {
          completeMfaEnrollment('authenticator');
        }
      }
    },
    [addMfa, completeMfaEnrollment, prepareAuthenticator, runMutation],
  );

  const openRemoveMfa = useCallback(
    (id: string) => {
      const method = mfaMethods.find(candidate => candidate.id === id);
      if (!method || method.type === 'backup-codes' || method.removable === false) {
        return;
      }
      setRemoveMfa({
        method: method.type,
        id: method.id,
        label: method.description ?? (method.type === 'sms' ? 'This phone number' : 'Authenticator app'),
        isSubmitting: false,
        errors: {},
      });
    },
    [mfaMethods],
  );
  const submitRemoveMfa = useCallback(() => {
    if (!removeMfa || removeMfa.isSubmitting) {
      return;
    }
    const { id, method } = removeMfa;
    const methodRemains = mfaMethods.some(candidate => candidate.id !== id && candidate.type === method);
    void runMutation('remove-mfa', () => {
      setMfaMethods(methods =>
        withMfaRemovalConstraints(
          methods.filter(candidate => candidate.id !== id),
          settingsRef.current.mfaRequired,
        ),
      );
      onMfaMethodChange?.(method, methodRemains);
      closeOperation('remove-mfa');
    });
  }, [closeOperation, mfaMethods, onMfaMethodChange, removeMfa, runMutation]);
  const regenerateBackupCodes = useCallback(() => {
    setBackupCodes({ step: 'generating', isSubmitting: true, errors: {} });
    void runMutation('backup-codes', () => {
      setBackupCodes({ step: 'codes', codes: GENERATED_BACKUP_CODES, copied: false, isSubmitting: false, errors: {} });
    });
  }, [runMutation]);
  const resendMfaCode = useCallback(async () => {
    setAddMfa(current =>
      current?.step === 'verify' ? { ...current, resend: { ...current.resend, isResending: true } } : current,
    );
    await sleep(settingsRef.current.latencyMs);
    setAddMfa(current =>
      current?.step === 'verify' ? { ...current, resend: { ...current.resend, isResending: false } } : current,
    );
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
    mfaMethods,
    addMfa,
    removeMfa,
    backupCodes,
    reverification,
    openAddMfa,
    closeAddMfa: () => closeOperation('add-mfa'),
    addNewMfaPhone: () =>
      setAddMfa({ method: 'sms', step: 'phone', phoneNumber: '+1', isSubmitting: false, errors: {} }),
    selectMfaPhone,
    updateMfaPhoneNumber: (phoneNumber: string) =>
      setAddMfa(current => (current?.step === 'phone' ? { ...current, phoneNumber, errors: {} } : current)),
    updateMfaCode: (code: string) =>
      setAddMfa(current => (current?.step === 'verify' ? { ...current, code, status: 'idle', errors: {} } : current)),
    toggleMfaDisplayFormat: () =>
      setAddMfa(current =>
        current?.step === 'setup'
          ? { ...current, displayFormat: current.displayFormat === 'qr' ? 'key' : 'qr' }
          : current,
      ),
    submitAddMfa,
    finishAddMfa: () => closeOperation('add-mfa'),
    markMfaBackupCodesCopied: () =>
      setAddMfa(current => (current?.step === 'backup-codes' ? { ...current, copied: true } : current)),
    resendMfaCode,
    openRemoveMfa,
    closeRemoveMfa: () => closeOperation('remove-mfa'),
    submitRemoveMfa,
    openBackupCodes: regenerateBackupCodes,
    closeBackupCodes: () => closeOperation('backup-codes'),
    regenerateBackupCodes,
    markBackupCodesCopied: () =>
      setBackupCodes(current => (current?.step === 'codes' ? { ...current, copied: true } : current)),
    updateVerificationValue,
    submitVerification,
    resendReverification,
    cancelReverification,
  };
}

function methodsFromConfig(
  hasMfaPhone: boolean,
  hasMfaAuthenticator: boolean,
  hasBackupCodes: boolean,
  mfaRequired: boolean,
  current: UserProfileMfaMethod[] = [],
) {
  const phones = current.filter(method => method.type === 'sms');
  const authenticator = current.find(method => method.type === 'authenticator');
  const backupCodes = current.find(method => method.type === 'backup-codes');
  return withMfaRemovalConstraints(
    [
      ...(hasMfaPhone
        ? phones.length > 0
          ? phones
          : [{ id: 'sms', type: 'sms' as const, description: '+1 801-888-8181' }]
        : []),
      ...(hasMfaAuthenticator ? [authenticator ?? { id: 'authenticator', type: 'authenticator' as const }] : []),
      ...(hasBackupCodes && (hasMfaPhone || hasMfaAuthenticator)
        ? [backupCodes ?? { id: 'backup-codes', type: 'backup-codes' as const }]
        : []),
    ],
    mfaRequired,
  );
}

function withMfaRemovalConstraints(methods: UserProfileMfaMethod[], mfaRequired: boolean) {
  const configuredCount = methods.filter(method => method.type !== 'backup-codes').length;
  return methods.map(method => ({
    ...method,
    removable: method.type === 'backup-codes' ? undefined : !mfaRequired || configuredCount > 1,
  }));
}
