import type {
  UserProfileBackupCodesFlowState,
  UserProfileMfaAddFlowState,
  UserProfileMfaMethodType,
  UserProfileMfaRemoveFlowState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import type { UserProfileMfaMethod } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { SecurityFlowConfig } from './user-profile-security-panel-flow.config';
import type { SecurityReverificationFlow } from './user-profile-security-panel-flow.reverification';

type MfaFlowSliceConfig = Pick<
  SecurityFlowConfig,
  | 'availableMfaPhone'
  | 'backupCodeCreationResult'
  | 'backupCodesAvailable'
  | 'failurePoint'
  | 'hasBackupCodes'
  | 'hasMfaAuthenticator'
  | 'hasMfaPhone'
  | 'latencyMs'
  | 'mfaRequired'
  | 'mfaVerificationResult'
  | 'requireReverification'
  | 'validCode'
>;
type MfaOperation = 'add-mfa' | 'remove-mfa' | 'backup-codes';

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

export function useMfaFlowSlice({
  config,
  reverificationFlow,
  onMfaMethodChange,
  onBackupCodesChange,
}: {
  config: MfaFlowSliceConfig;
  reverificationFlow: SecurityReverificationFlow;
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
  const pendingOperations = useRef(new Set<MfaOperation>());
  const mfaCodeVerificationPending = useRef(false);
  const smsPreparationPending = useRef(false);
  const smsResendPending = useRef(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const captureTrigger = useCallback(() => {
    const active = document.activeElement;
    triggerRef.current = active instanceof HTMLElement ? active : null;
  }, []);

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

  const closeOperation = useCallback(
    (operation: MfaOperation) => {
      reverificationFlow.cancelReverification(operation);
      if (operation === 'add-mfa') {
        setAddMfa(null);
      } else if (operation === 'remove-mfa') {
        setRemoveMfa(null);
      } else {
        setBackupCodes(null);
      }
    },
    [reverificationFlow],
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
  const runMutation = useCallback(
    async (
      operation: MfaOperation,
      onSuccess: () => void,
      { closeOnReverificationCancel = false }: { closeOnReverificationCancel?: boolean } = {},
    ) => {
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
        const verified = await reverificationFlow.requestReverification(operation);
        if (!verified) {
          setSubmitting(operation, false);
          if (operation === 'backup-codes' || closeOnReverificationCancel) {
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
      } finally {
        pendingOperations.current.delete(operation);
      }
    },
    [closeOperation, reverificationFlow, setSubmitting],
  );

  const completeMfaEnrollment = useCallback(
    (method: UserProfileMfaMethodType, identifier?: string) => {
      const hasBackupCodes = mfaMethods.some(candidate => candidate.type === 'backup-codes');
      const generatedBackupCodes =
        settingsRef.current.backupCodesAvailable &&
        !hasBackupCodes &&
        settingsRef.current.backupCodeCreationResult === 'success';
      const nextMethod: UserProfileMfaMethod =
        method === 'sms'
          ? {
              id: `sms-${Date.now()}`,
              type: 'sms',
              description: identifier,
              isDefault:
                !mfaMethods.some(candidate => candidate.type === 'authenticator') &&
                !mfaMethods.some(candidate => candidate.type === 'sms'),
            }
          : { id: 'authenticator', type: 'authenticator', isDefault: true };
      setMfaMethods(methods =>
        withMfaRemovalConstraints(
          [
            ...methods.filter(candidate =>
              method === 'sms'
                ? candidate.type !== 'backup-codes'
                : candidate.type !== method && candidate.type !== 'backup-codes',
            ),
            nextMethod,
            ...(hasBackupCodes || generatedBackupCodes ? [{ id: 'backup-codes', type: 'backup-codes' as const }] : []),
          ],
          settingsRef.current.mfaRequired,
        ),
      );
      onMfaMethodChange?.(method, true);
      if (generatedBackupCodes) {
        onBackupCodesChange?.(true);
        setAddMfa({
          method,
          step: 'backup-codes',
          codes: GENERATED_BACKUP_CODES,
          copied: false,
          isSubmitting: false,
          errors: {},
        });
      } else {
        closeOperation('add-mfa');
      }
    },
    [closeOperation, mfaMethods, onBackupCodesChange, onMfaMethodChange],
  );
  const prepareAuthenticator = useCallback(() => {
    if (pendingOperations.current.has('add-mfa')) {
      return;
    }
    setAddMfa({ method: 'authenticator', step: 'preparing', isSubmitting: true, errors: {} });
    void runMutation(
      'add-mfa',
      () =>
        setAddMfa({
          method: 'authenticator',
          step: 'setup',
          displayFormat: 'qr',
          secret: 'JBSWY3DPEHPK3PXP',
          uri: 'otpauth://totp/Clerk:preston@clerk.dev?secret=JBSWY3DPEHPK3PXP&issuer=Clerk',
          copied: false,
          isSubmitting: false,
          errors: {},
        }),
      { closeOnReverificationCancel: true },
    );
  }, [runMutation]);
  const prepareSms = useCallback(async (identifier: string, returnStep: 'select-phone' | 'phone') => {
    if (smsPreparationPending.current) {
      return;
    }
    smsPreparationPending.current = true;
    try {
      setAddMfa({ method: 'sms', step: 'preparing-sms', identifier, returnStep, isSubmitting: true, errors: {} });
      await sleep(settingsRef.current.latencyMs);
      if (settingsRef.current.failurePoint === 'initial-request') {
        setAddMfa({
          method: 'sms',
          step: 'preparing-sms',
          identifier,
          returnStep,
          isSubmitting: false,
          errors: { form: 'Could not send a verification code.' },
        });
        return;
      }
      setAddMfa({
        method: 'sms',
        step: 'verify',
        identifier,
        code: '',
        status: 'idle',
        resend: IDLE_RESEND,
        returnStep,
        isSubmitting: false,
        errors: {},
      });
    } finally {
      smsPreparationPending.current = false;
    }
  }, []);
  const openAddMfa = useCallback(
    (method: UserProfileMfaMethodType) => {
      captureTrigger();
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
    [captureTrigger, prepareAuthenticator],
  );
  const selectMfaPhone = useCallback(
    (id: string) => {
      captureTrigger();
      if (!addMfa || addMfa.step !== 'select-phone' || pendingOperations.current.has('add-mfa')) {
        return;
      }
      const phone = addMfa.phones.find(candidate => candidate.id === id);
      if (!phone) {
        return;
      }
      if (!phone.isVerified) {
        void prepareSms(phone.label, 'select-phone');
        return;
      }
      setAddMfa(current =>
        current?.step === 'select-phone' ? { ...current, loadingPhoneId: id, isSubmitting: true, errors: {} } : current,
      );
      void runMutation('add-mfa', () => completeMfaEnrollment('sms', phone.label));
    },
    [addMfa, captureTrigger, completeMfaEnrollment, prepareSms, runMutation],
  );
  const submitAddMfa = useCallback(
    async (completedCode?: string) => {
      const current = addMfa;
      if (!current || current.isSubmitting || mfaCodeVerificationPending.current) {
        return;
      }
      if (current.step === 'preparing') {
        prepareAuthenticator();
      } else if (current.step === 'preparing-sms') {
        void prepareSms(current.identifier, current.returnStep ?? 'phone');
      } else if (current.step === 'phone') {
        void prepareSms(current.phoneNumber, 'phone');
      } else if (current.step === 'setup') {
        setAddMfa({
          method: 'authenticator',
          step: 'verify',
          code: '',
          status: 'idle',
          resend: IDLE_RESEND,
          returnStep: 'setup',
          isSubmitting: false,
          errors: {},
        });
      } else if (current.step === 'verify') {
        mfaCodeVerificationPending.current = true;
        try {
          setAddMfa(value => (value?.step === 'verify' ? { ...value, status: 'verifying', errors: {} } : value));
          await sleep(settingsRef.current.latencyMs);
          if (settingsRef.current.mfaVerificationResult === 'server-error') {
            setAddMfa(value =>
              value?.step === 'verify'
                ? {
                    ...value,
                    status: 'error',
                    isSubmitting: false,
                    errors: { form: 'Something went wrong. Please try again.' },
                  }
                : value,
            );
          } else if ((completedCode ?? current.code) !== settingsRef.current.validCode) {
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
        } finally {
          mfaCodeVerificationPending.current = false;
        }
      }
    },
    [addMfa, completeMfaEnrollment, prepareAuthenticator, prepareSms, runMutation],
  );

  const openRemoveMfa = useCallback(
    (id: string) => {
      const method = mfaMethods.find(candidate => candidate.id === id);
      if (!method || method.type === 'backup-codes' || method.removable === false) {
        return;
      }
      captureTrigger();
      setRemoveMfa({
        method: method.type,
        id: method.id,
        label: method.description ?? (method.type === 'sms' ? 'This phone number' : 'Authenticator app'),
        isSubmitting: false,
        errors: {},
      });
    },
    [captureTrigger, mfaMethods],
  );
  const submitRemoveMfa = useCallback(() => {
    if (!removeMfa || removeMfa.isSubmitting || pendingOperations.current.has('remove-mfa')) {
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
    if (
      backupCodes?.isSubmitting ||
      pendingOperations.current.has('backup-codes') ||
      !settingsRef.current.backupCodesAvailable
    ) {
      return;
    }
    setBackupCodes({ step: 'generating', isSubmitting: true, errors: {} });
    void runMutation('backup-codes', () => {
      if (settingsRef.current.backupCodeCreationResult === 'unavailable') {
        setBackupCodes({ step: 'unavailable', isSubmitting: false, errors: {} });
        return;
      }
      setMfaMethods(methods =>
        methods.some(method => method.type === 'backup-codes')
          ? methods
          : [...methods, { id: 'backup-codes', type: 'backup-codes' }],
      );
      onBackupCodesChange?.(true);
      setBackupCodes({ step: 'codes', codes: GENERATED_BACKUP_CODES, isSubmitting: false, errors: {} });
    });
  }, [backupCodes?.isSubmitting, onBackupCodesChange, runMutation]);
  const openBackupCodes = useCallback(() => {
    if (!settingsRef.current.backupCodesAvailable) {
      return;
    }
    captureTrigger();
    regenerateBackupCodes();
  }, [captureTrigger, regenerateBackupCodes]);
  const setDefaultMfa = useCallback((id: string) => {
    setMfaMethods(methods =>
      withMfaRemovalConstraints(
        methods.map(method => (method.type === 'sms' ? { ...method, isDefault: method.id === id } : method)),
        settingsRef.current.mfaRequired,
      ),
    );
  }, []);
  const resendMfaCode = useCallback(async () => {
    if (smsResendPending.current) {
      return;
    }
    smsResendPending.current = true;
    setAddMfa(current =>
      current?.step === 'verify' ? { ...current, resend: { ...current.resend, isResending: true } } : current,
    );
    try {
      await sleep(settingsRef.current.latencyMs);
      setAddMfa(current =>
        current?.step === 'verify' ? { ...current, resend: { isResending: false, secondsRemaining: 30 } } : current,
      );
    } finally {
      smsResendPending.current = false;
    }
  }, []);

  useEffect(() => {
    if (addMfa?.step !== 'verify' || addMfa.resend.secondsRemaining <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setAddMfa(current =>
        current?.step === 'verify'
          ? {
              ...current,
              resend: { ...current.resend, secondsRemaining: Math.max(0, current.resend.secondsRemaining - 1) },
            }
          : current,
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [addMfa]);

  const backAddMfa = useCallback(() => {
    setAddMfa(current => {
      if (!current) {
        return current;
      }
      if (current.step === 'verify' || current.step === 'preparing-sms') {
        if (current.returnStep === 'select-phone') {
          return {
            method: 'sms',
            step: 'select-phone',
            phones: [{ id: 'existing-phone', label: '+1 801-888-8181', isVerified: false }],
            isSubmitting: false,
            errors: {},
          };
        }
        if (current.returnStep === 'phone') {
          return {
            method: 'sms',
            step: 'phone',
            phoneNumber: current.identifier ?? '+1',
            isSubmitting: false,
            errors: {},
          };
        }
        if (current.returnStep === 'setup') {
          return {
            method: 'authenticator',
            step: 'setup',
            displayFormat: 'qr',
            secret: 'JBSWY3DPEHPK3PXP',
            uri: 'otpauth://totp/Clerk:preston@clerk.dev?secret=JBSWY3DPEHPK3PXP&issuer=Clerk',
            copied: false,
            isSubmitting: false,
            errors: {},
          };
        }
      }
      return current;
    });
  }, []);

  return {
    triggerRef,
    mfaMethods,
    addMfa,
    removeMfa,
    backupCodes,
    openAddMfa,
    closeAddMfa: () => {
      if (!addMfa?.isSubmitting) {
        closeOperation('add-mfa');
      }
    },
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
    copyMfaSecret: () => setAddMfa(current => (current?.step === 'setup' ? { ...current, copied: true } : current)),
    backAddMfa,
    submitAddMfa,
    finishAddMfa: () => closeOperation('add-mfa'),
    markMfaBackupCodesCopied: () =>
      setAddMfa(current => (current?.step === 'backup-codes' ? { ...current, copied: true } : current)),
    resendMfaCode,
    openRemoveMfa,
    closeRemoveMfa: () => {
      if (!removeMfa?.isSubmitting) {
        closeOperation('remove-mfa');
      }
    },
    submitRemoveMfa,
    openBackupCodes,
    setDefaultMfa,
    closeBackupCodes: () => {
      if (!backupCodes?.isSubmitting) {
        closeOperation('backup-codes');
      }
    },
    regenerateBackupCodes,
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
          : [
              {
                id: 'sms',
                type: 'sms' as const,
                description: '+1 801-888-8181',
                isDefault: !hasMfaAuthenticator,
              },
            ]
        : []),
      ...(hasMfaAuthenticator
        ? [authenticator ?? { id: 'authenticator', type: 'authenticator' as const, isDefault: true }]
        : []),
      ...(hasBackupCodes && (hasMfaPhone || hasMfaAuthenticator)
        ? [backupCodes ?? { id: 'backup-codes', type: 'backup-codes' as const }]
        : []),
    ],
    mfaRequired,
  );
}

function withMfaRemovalConstraints(methods: UserProfileMfaMethod[], mfaRequired: boolean) {
  const hasAuthenticator = methods.some(method => method.type === 'authenticator');
  const hasDefaultPhone = methods.some(method => method.type === 'sms' && method.isDefault);
  let assignedPhoneDefault = false;
  const normalizedMethods = methods.map(method => {
    if (method.type === 'authenticator') {
      return { ...method, isDefault: true };
    }
    if (method.type !== 'sms') {
      return method;
    }
    const isDefault = !hasAuthenticator && !assignedPhoneDefault && (method.isDefault || !hasDefaultPhone);
    assignedPhoneDefault ||= isDefault;
    return { ...method, isDefault };
  });
  const configuredCount = normalizedMethods.filter(method => method.type !== 'backup-codes').length;
  return normalizedMethods.map(method => ({
    ...method,
    removable: method.type === 'backup-codes' ? undefined : !mfaRequired || configuredCount > 1,
  }));
}
