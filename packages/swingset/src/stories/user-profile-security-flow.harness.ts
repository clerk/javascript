import type {
  ReverificationChallengeState,
  UserProfileDeleteAccountFlowState,
  UserProfileDeviceDetailsFlowState,
  UserProfilePasswordField,
  UserProfilePasswordFlowState,
  UserProfilePasswordValues,
  UserProfileSignOutAllDevicesFlowState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import type { UserProfileDevice } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SecurityFlowConfig {
  latencyMs: number;
  passwordAvailable: boolean;
  hasPassword: boolean;
  requireReverification: boolean;
  reverificationStrategy: ReverificationChallengeState['strategy'];
  failurePoint: 'none' | 'initial-request' | 'reverification' | 'retried-mutation';
  validCode: string;
  validPassword: string;
}

export const DEFAULT_SECURITY_FLOW_CONFIG: SecurityFlowConfig = {
  latencyMs: 900,
  passwordAvailable: true,
  hasPassword: true,
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

type SecurityOperation = 'password' | 'delete-account' | 'sign-out-device' | 'sign-out-all-devices';

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
}: {
  config?: SecurityFlowConfig;
  initialDevices: UserProfileDevice[];
  onHasPasswordChange?: (hasPassword: boolean) => void;
}) {
  const settingsRef = useRef(config);
  settingsRef.current = config;

  const [hasPassword, setHasPassword] = useState(config.hasPassword);
  const [devices, setDevices] = useState(initialDevices);
  const [password, setPassword] = useState<UserProfilePasswordFlowState | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<UserProfileDeleteAccountFlowState | null>(null);
  const [device, setDevice] = useState<UserProfileDeviceDetailsFlowState | null>(null);
  const [signOutAllDevices, setSignOutAllDevices] = useState<UserProfileSignOutAllDevicesFlowState | null>(null);
  const [reverification, setReverification] = useState<ReverificationState | null>(null);
  const verificationGate = useRef<{ operation: SecurityOperation; resolve: (verified: boolean) => void } | null>(null);

  useEffect(() => setHasPassword(config.hasPassword), [config.hasPassword]);

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
    devices,
    password,
    deleteAccount,
    device,
    signOutAllDevices,
    reverification,
    openPassword,
    closePassword: () => closeOperation('password'),
    updatePasswordValue,
    submitPassword,
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
