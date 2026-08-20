import type {
  ReverificationChallengeState,
  UserProfileDeleteAccountFlowState,
  UserProfileDeviceDetailsFlowState,
  UserProfileMfaAddFlowState,
  UserProfileMfaMethodType,
  UserProfileMfaRemoveFlowState,
  UserProfilePasskeyAddFlowState,
  UserProfilePasskeyRemoveFlowState,
  UserProfilePasskeyRenameFlowState,
  UserProfilePasswordField,
  UserProfilePasswordFlowState,
  UserProfilePasswordValues,
  UserProfileSignOutAllDevicesFlowState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import type {
  UserProfileDevice,
  UserProfileMfaMethod,
  UserProfilePasskey,
} from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SecurityFlowConfig {
  latencyMs: number;
  passwordAvailable: boolean;
  hasPassword: boolean;
  passkeysAvailable: boolean;
  hasPasskey: boolean;
  hasMfaPhone: boolean;
  hasMfaAuthenticator: boolean;
  requireReverification: boolean;
  reverificationStrategy: Exclude<ReverificationChallengeState['strategy'], 'backup_code'>;
  failurePoint: 'none' | 'initial-request' | 'reverification' | 'retried-mutation';
  validCode: string;
  validPassword: string;
}

export const DEFAULT_SECURITY_FLOW_CONFIG: SecurityFlowConfig = {
  latencyMs: 900,
  passwordAvailable: true,
  hasPassword: true,
  passkeysAvailable: true,
  hasPasskey: true,
  hasMfaPhone: false,
  hasMfaAuthenticator: false,
  requireReverification: false,
  reverificationStrategy: 'email_code',
  failurePoint: 'none',
  validCode: '424242',
  validPassword: 'clerk',
};

const EMPTY_PASSWORD_VALUES: UserProfilePasswordValues = {
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: true,
};

type SecurityOperation =
  | 'password'
  | 'add-passkey'
  | 'rename-passkey'
  | 'remove-passkey'
  | 'add-mfa'
  | 'remove-mfa'
  | 'delete-account'
  | 'sign-out-device'
  | 'sign-out-all-devices';

interface ReverificationState {
  operation: SecurityOperation;
  state: ReverificationChallengeState;
}

const IDLE_RESEND = { isResending: false, secondsRemaining: 0 };

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useSecurityFlow({
  config = DEFAULT_SECURITY_FLOW_CONFIG,
  initialDevices,
  onHasPasswordChange,
  onHasPasskeyChange,
  onMfaMethodChange,
}: {
  config?: SecurityFlowConfig;
  initialDevices: UserProfileDevice[];
  onHasPasswordChange?: (hasPassword: boolean) => void;
  onHasPasskeyChange?: (hasPasskey: boolean) => void;
  onMfaMethodChange?: (method: UserProfileMfaMethodType, enabled: boolean) => void;
}) {
  const settingsRef = useRef(config);
  settingsRef.current = config;

  const [hasPassword, setHasPassword] = useState(config.hasPassword);
  const [devices, setDevices] = useState(initialDevices);
  const [mfaMethods, setMfaMethods] = useState<UserProfileMfaMethod[]>(() =>
    methodsFromConfig(config.hasMfaPhone, config.hasMfaAuthenticator),
  );
  const [passkeys, setPasskeys] = useState<UserProfilePasskey[]>(() => passkeysFromConfig(config.hasPasskey));
  const [password, setPassword] = useState<UserProfilePasswordFlowState | null>(null);
  const [addPasskey, setAddPasskey] = useState<UserProfilePasskeyAddFlowState | null>(null);
  const [renamePasskey, setRenamePasskey] = useState<UserProfilePasskeyRenameFlowState | null>(null);
  const [removePasskey, setRemovePasskey] = useState<UserProfilePasskeyRemoveFlowState | null>(null);
  const [addMfa, setAddMfa] = useState<UserProfileMfaAddFlowState | null>(null);
  const [removeMfa, setRemoveMfa] = useState<UserProfileMfaRemoveFlowState | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<UserProfileDeleteAccountFlowState | null>(null);
  const [device, setDevice] = useState<UserProfileDeviceDetailsFlowState | null>(null);
  const [signOutAllDevices, setSignOutAllDevices] = useState<UserProfileSignOutAllDevicesFlowState | null>(null);
  const [reverification, setReverification] = useState<ReverificationState | null>(null);
  const verificationGate = useRef<{ operation: SecurityOperation; resolve: (verified: boolean) => void } | null>(null);

  useEffect(() => setHasPassword(config.hasPassword), [config.hasPassword]);
  useEffect(() => setPasskeys(current => passkeysFromConfig(config.hasPasskey, current)), [config.hasPasskey]);
  useEffect(
    () => setMfaMethods(current => methodsFromConfig(config.hasMfaPhone, config.hasMfaAuthenticator, current)),
    [config.hasMfaAuthenticator, config.hasMfaPhone],
  );

  const cancelReverification = useCallback(() => {
    verificationGate.current?.resolve(false);
    verificationGate.current = null;
    setReverification(null);
  }, []);

  const closeOperation = useCallback(
    (operation: SecurityOperation) => {
      if (verificationGate.current?.operation === operation) {
        cancelReverification();
      }
      if (operation === 'password') {
        setPassword(null);
      } else if (operation === 'add-passkey') {
        setAddPasskey(null);
      } else if (operation === 'rename-passkey') {
        setRenamePasskey(null);
      } else if (operation === 'remove-passkey') {
        setRemovePasskey(null);
      } else if (operation === 'add-mfa') {
        setAddMfa(null);
      } else if (operation === 'remove-mfa') {
        setRemoveMfa(null);
      } else if (operation === 'delete-account') {
        setDeleteAccount(null);
      } else if (operation === 'sign-out-device') {
        setDevice(null);
      } else {
        setSignOutAllDevices(null);
      }
    },
    [cancelReverification],
  );

  const setSubmitting = useCallback((operation: SecurityOperation, isSubmitting: boolean, formError?: string) => {
    if (operation === 'password') {
      setPassword(current =>
        current ? { ...current, isSubmitting, errors: formError ? { form: formError } : {} } : current,
      );
    } else if (operation === 'add-passkey') {
      setAddPasskey(current =>
        current ? { ...current, isSubmitting, errors: formError ? { form: formError } : {} } : current,
      );
    } else if (operation === 'rename-passkey') {
      setRenamePasskey(current =>
        current ? { ...current, isSubmitting, errors: formError ? { form: formError } : {} } : current,
      );
    } else if (operation === 'remove-passkey') {
      setRemovePasskey(current =>
        current ? { ...current, isSubmitting, errors: formError ? { form: formError } : {} } : current,
      );
    } else if (operation === 'add-mfa') {
      setAddMfa(current =>
        current
          ? {
              ...current,
              isSubmitting,
              ...(current.step === 'verify' && formError ? { status: 'error' as const } : {}),
              errors: formError ? { form: formError } : {},
            }
          : current,
      );
    } else if (operation === 'remove-mfa') {
      setRemoveMfa(current =>
        current ? { ...current, isSubmitting, errors: formError ? { form: formError } : {} } : current,
      );
    } else if (operation === 'delete-account') {
      setDeleteAccount(current =>
        current ? { ...current, isSubmitting, errors: formError ? { form: formError } : {} } : current,
      );
    } else if (operation === 'sign-out-device') {
      setDevice(current =>
        current ? { ...current, isSubmitting, errors: formError ? { form: formError } : {} } : current,
      );
    } else {
      setSignOutAllDevices(current =>
        current ? { ...current, isSubmitting, errors: formError ? { form: formError } : {} } : current,
      );
    }
  }, []);

  const requestReverification = useCallback((operation: SecurityOperation) => {
    if (!settingsRef.current.requireReverification) {
      return Promise.resolve(true);
    }

    setReverification({
      operation,
      state: {
        strategy: settingsRef.current.reverificationStrategy,
        identifier:
          settingsRef.current.reverificationStrategy === 'email_code'
            ? 'i••••@clerk.dev'
            : settingsRef.current.reverificationStrategy === 'phone_code'
              ? '+1 ••• ••• 4242'
              : undefined,
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
    async (operation: SecurityOperation, onSuccess: () => void) => {
      setSubmitting(operation, true);

      await sleep(settingsRef.current.latencyMs);
      if (settingsRef.current.failurePoint === 'initial-request') {
        setSubmitting(operation, false, 'Something went wrong. Please try again.');
        return;
      }

      const verified = await requestReverification(operation);
      if (!verified) {
        setSubmitting(operation, false, 'Verification was canceled.');
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
    [requestReverification, setSubmitting],
  );

  const openPassword = useCallback(() => {
    setPassword({
      mode: hasPassword ? 'change' : 'set',
      values: EMPTY_PASSWORD_VALUES,
      isSubmitting: false,
      errors: {},
    });
  }, [hasPassword]);

  const updatePasswordValue = useCallback(
    <Field extends UserProfilePasswordField>(field: Field, value: UserProfilePasswordValues[Field]) => {
      setPassword(current =>
        current
          ? {
              ...current,
              values: { ...current.values, [field]: value },
              errors: {},
            }
          : current,
      );
    },
    [],
  );

  const submitPassword = useCallback(() => {
    const current = password;
    if (!current || current.values.newPassword !== current.values.confirmPassword) {
      setPassword(state => (state ? { ...state, errors: { confirmPassword: 'Passwords do not match.' } } : state));
      return;
    }
    void runMutation('password', () => {
      setHasPassword(true);
      onHasPasswordChange?.(true);
      closeOperation('password');
    });
  }, [closeOperation, onHasPasswordChange, password, runMutation]);

  const openAddPasskey = useCallback(() => {
    setAddPasskey({ isSubmitting: false, errors: {} });
  }, []);

  const submitAddPasskey = useCallback(() => {
    void runMutation('add-passkey', () => {
      setPasskeys(current => [
        ...current,
        {
          id: `passkey-${Date.now()}`,
          name: `Passkey ${current.length + 1}`,
          createdAtLabel: 'Created just now',
        },
      ]);
      onHasPasskeyChange?.(true);
      closeOperation('add-passkey');
    });
  }, [closeOperation, onHasPasskeyChange, runMutation]);

  const openRenamePasskey = useCallback(
    (id: string) => {
      const passkey = passkeys.find(candidate => candidate.id === id);
      if (passkey) {
        setRenamePasskey({
          id,
          originalName: passkey.name,
          name: passkey.name,
          isSubmitting: false,
          errors: {},
        });
      }
    },
    [passkeys],
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
      const passkey = passkeys.find(candidate => candidate.id === id);
      if (passkey) {
        setRemovePasskey({ id, name: passkey.name, isSubmitting: false, errors: {} });
      }
    },
    [passkeys],
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

  const openAddMfa = useCallback((method: UserProfileMfaMethodType) => {
    if (method === 'sms') {
      setAddMfa({ method, step: 'phone', phoneNumber: '+1', isSubmitting: false, errors: {} });
      return;
    }
    setAddMfa({
      method,
      step: 'setup',
      displayFormat: 'qr',
      secret: 'JBSWY3DPEHPK3PXP',
      isSubmitting: false,
      errors: {},
    });
  }, []);

  const submitAddMfa = useCallback(
    async (completedCode?: string) => {
      const current = addMfa;
      if (!current) {
        return;
      }

      if (current.step === 'phone') {
        setAddMfa(value => (value ? { ...value, isSubmitting: true, errors: {} } : value));
        await sleep(settingsRef.current.latencyMs);
        if (settingsRef.current.failurePoint === 'initial-request') {
          setAddMfa(value =>
            value
              ? { ...value, isSubmitting: false, errors: { form: 'Something went wrong. Please try again.' } }
              : value,
          );
          return;
        }
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
        return;
      }

      if (current.step === 'setup') {
        setAddMfa({
          method: 'authenticator',
          step: 'verify',
          code: '',
          status: 'idle',
          resend: IDLE_RESEND,
          isSubmitting: false,
          errors: {},
        });
        return;
      }

      setAddMfa(value => (value && value.step === 'verify' ? { ...value, status: 'verifying', errors: {} } : value));
      await sleep(settingsRef.current.latencyMs);
      if ((completedCode ?? current.code) !== settingsRef.current.validCode) {
        setAddMfa(value =>
          value && value.step === 'verify'
            ? {
                ...value,
                code: '',
                status: 'error',
                errors: { field: 'Incorrect code. Please try again.' },
              }
            : value,
        );
        return;
      }

      void runMutation('add-mfa', () => {
        const method: UserProfileMfaMethod =
          current.method === 'sms'
            ? { id: 'sms', type: 'sms', description: current.identifier }
            : { id: 'authenticator', type: 'authenticator' };
        setMfaMethods(methods => [...methods.filter(candidate => candidate.type !== current.method), method]);
        onMfaMethodChange?.(current.method, true);
        closeOperation('add-mfa');
      });
    },
    [addMfa, closeOperation, onMfaMethodChange, runMutation],
  );

  const openRemoveMfa = useCallback(
    (id: string) => {
      const method = mfaMethods.find(candidate => candidate.id === id);
      if (!method || method.type === 'backup-codes') {
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
    if (!removeMfa) {
      return;
    }
    const { id, method } = removeMfa;
    void runMutation('remove-mfa', () => {
      setMfaMethods(methods => methods.filter(candidate => candidate.id !== id));
      onMfaMethodChange?.(method, false);
      closeOperation('remove-mfa');
    });
  }, [closeOperation, onMfaMethodChange, removeMfa, runMutation]);

  const resendMfaCode = useCallback(async () => {
    setAddMfa(current =>
      current && current.step === 'verify' ? { ...current, resend: { ...current.resend, isResending: true } } : current,
    );
    await sleep(settingsRef.current.latencyMs);
    setAddMfa(current =>
      current && current.step === 'verify'
        ? { ...current, resend: { ...current.resend, isResending: false } }
        : current,
    );
  }, []);

  const openDeleteAccount = useCallback(() => {
    setDeleteAccount({ confirmation: '', isSubmitting: false, errors: {} });
  }, []);

  const submitDeleteAccount = useCallback(() => {
    void runMutation('delete-account', () => closeOperation('delete-account'));
  }, [closeOperation, runMutation]);

  const openSignOutAllDevices = useCallback(() => {
    setSignOutAllDevices({ isSubmitting: false, errors: {} });
  }, []);

  const submitSignOutAllDevices = useCallback(() => {
    void runMutation('sign-out-all-devices', () => {
      setDevices(current => current.filter(device => device.isCurrent));
      closeOperation('sign-out-all-devices');
    });
  }, [closeOperation, runMutation]);

  const openDevice = useCallback(
    (id: string) => {
      const selected = devices.find(candidate => candidate.id === id);
      if (!selected) {
        return;
      }
      setDevice({
        step: 'details',
        device: {
          id: selected.id,
          title: selected.details?.title ?? selected.name,
          lastActiveAtLabel: selected.details?.lastActiveAtLabel ?? selected.description ?? 'Active now',
          deviceName: selected.details?.deviceName ?? selected.name,
          browserName: selected.details?.browserName ?? 'Unknown',
          ipAddress: selected.details?.ipAddress ?? 'Unknown',
          location: selected.details?.location ?? 'Unknown',
          locationFlag: selected.details?.locationFlag,
          originalSignInAtLabel: selected.details?.originalSignInAtLabel ?? 'Unknown',
        },
        isSubmitting: false,
        errors: {},
      });
    },
    [devices],
  );

  const requestSignOutDevice = useCallback(() => {
    setDevice(current => (current ? { ...current, step: 'confirm', errors: {} } : current));
  }, []);

  const cancelSignOutDevice = useCallback(() => {
    setDevice(current => (current ? { ...current, step: 'details', errors: {} } : current));
  }, []);

  const submitSignOutDevice = useCallback(() => {
    if (!device) {
      return;
    }
    const deviceId = device.device.id;
    void runMutation('sign-out-device', () => {
      setDevices(current => current.filter(candidate => candidate.id !== deviceId));
      closeOperation('sign-out-device');
    });
  }, [closeOperation, device, runMutation]);

  const updateVerificationValue = useCallback((value: string) => {
    setReverification(current =>
      current ? { ...current, state: { ...current.state, value, status: 'idle', errors: {} } } : current,
    );
  }, []);

  const submitVerification = useCallback(async () => {
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
              state: {
                ...value.state,
                status: 'error',
                errors: { form: 'Something went wrong. Please try again.' },
              },
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
    if (current.state.value !== expected) {
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
  }, [reverification]);

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
    config,
    hasPassword,
    passkeys,
    mfaMethods,
    devices,
    password,
    addPasskey,
    renamePasskey,
    removePasskey,
    addMfa,
    removeMfa,
    deleteAccount,
    device,
    signOutAllDevices,
    reverification,
    openPassword,
    closePassword: () => closeOperation('password'),
    updatePasswordValue,
    submitPassword,
    openAddPasskey,
    closeAddPasskey: () => closeOperation('add-passkey'),
    submitAddPasskey,
    openRenamePasskey,
    closeRenamePasskey: () => closeOperation('rename-passkey'),
    updatePasskeyName: (name: string) =>
      setRenamePasskey(current => (current ? { ...current, name, errors: {} } : current)),
    submitRenamePasskey,
    openRemovePasskey,
    closeRemovePasskey: () => closeOperation('remove-passkey'),
    submitRemovePasskey,
    openAddMfa,
    closeAddMfa: () => closeOperation('add-mfa'),
    updateMfaPhoneNumber: (phoneNumber: string) =>
      setAddMfa(current => (current && current.step === 'phone' ? { ...current, phoneNumber, errors: {} } : current)),
    updateMfaCode: (code: string) =>
      setAddMfa(current =>
        current && current.step === 'verify' ? { ...current, code, status: 'idle', errors: {} } : current,
      ),
    toggleMfaDisplayFormat: () =>
      setAddMfa(current =>
        current && current.step === 'setup'
          ? { ...current, displayFormat: current.displayFormat === 'qr' ? 'key' : 'qr' }
          : current,
      ),
    submitAddMfa,
    resendMfaCode,
    openRemoveMfa,
    closeRemoveMfa: () => closeOperation('remove-mfa'),
    submitRemoveMfa,
    openDeleteAccount,
    closeDeleteAccount: () => closeOperation('delete-account'),
    updateDeleteConfirmation: (confirmation: string) =>
      setDeleteAccount(current => (current ? { ...current, confirmation, errors: {} } : current)),
    submitDeleteAccount,
    openDevice,
    closeDevice: () => closeOperation('sign-out-device'),
    requestSignOutDevice,
    cancelSignOutDevice,
    submitSignOutDevice,
    openSignOutAllDevices,
    closeSignOutAllDevices: () => closeOperation('sign-out-all-devices'),
    submitSignOutAllDevices,
    updateVerificationValue,
    submitVerification,
    resendReverification,
    cancelReverification,
  };
}

function methodsFromConfig(hasMfaPhone: boolean, hasMfaAuthenticator: boolean, current: UserProfileMfaMethod[] = []) {
  const phone = current.find(method => method.type === 'sms');
  const authenticator = current.find(method => method.type === 'authenticator');
  return [
    ...(hasMfaPhone ? [phone ?? { id: 'sms', type: 'sms' as const, description: '+1 801-888-8181' }] : []),
    ...(hasMfaAuthenticator ? [authenticator ?? { id: 'authenticator', type: 'authenticator' as const }] : []),
  ];
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
