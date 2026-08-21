import type {
  ReverificationChallengeState,
  UserProfileDeviceDetailsFlowState,
  UserProfileSignOutAllDevicesFlowState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import type { UserProfileDevice } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { SecurityFlowConfig } from './user-profile-security-flow.config';

type ActiveDevicesSectionFlowConfig = Pick<
  SecurityFlowConfig,
  'failurePoint' | 'latencyMs' | 'requireReverification' | 'reverificationStrategy' | 'validCode' | 'validPassword'
>;
type DeviceOperation = 'sign-out-device' | 'sign-out-all-devices';

interface DeviceReverificationState {
  operation: DeviceOperation;
  state: ReverificationChallengeState;
}

const IDLE_RESEND = { isResending: false, secondsRemaining: 0 };
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useActiveDevicesSectionFlow({
  config,
  initialDevices,
}: {
  config: ActiveDevicesSectionFlowConfig;
  initialDevices: UserProfileDevice[];
}) {
  const settingsRef = useRef(config);
  settingsRef.current = config;
  const [devices, setDevices] = useState(initialDevices);
  const [device, setDevice] = useState<UserProfileDeviceDetailsFlowState | null>(null);
  const [signOutAllDevices, setSignOutAllDevices] = useState<UserProfileSignOutAllDevicesFlowState | null>(null);
  const [reverification, setReverification] = useState<DeviceReverificationState | null>(null);
  const verificationGate = useRef<{ operation: DeviceOperation; resolve: (verified: boolean) => void } | null>(null);

  useEffect(() => setDevices(initialDevices), [initialDevices]);

  const cancelReverification = useCallback(() => {
    verificationGate.current?.resolve(false);
    verificationGate.current = null;
    setReverification(null);
  }, []);
  const closeOperation = useCallback(
    (operation: DeviceOperation) => {
      if (verificationGate.current?.operation === operation) {
        cancelReverification();
      }
      if (operation === 'sign-out-device') {
        setDevice(null);
      } else {
        setSignOutAllDevices(null);
      }
    },
    [cancelReverification],
  );
  const setSubmitting = useCallback((operation: DeviceOperation, isSubmitting: boolean, formError?: string) => {
    const errors = formError ? { form: formError } : {};
    if (operation === 'sign-out-device') {
      setDevice(current => (current ? { ...current, isSubmitting, errors } : current));
    } else {
      setSignOutAllDevices(current => (current ? { ...current, isSubmitting, errors } : current));
    }
  }, []);
  const requestReverification = useCallback((operation: DeviceOperation) => {
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
    async (operation: DeviceOperation, onSuccess: () => void) => {
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

  const openDevice = useCallback(
    (id: string) => {
      const selected = devices.find(candidate => candidate.id === id);
      if (!selected || selected.isCurrent) {
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
    if (!device || device.isSubmitting) {
      return;
    }
    const deviceId = device.device.id;
    void runMutation('sign-out-device', () => {
      setDevices(current => current.filter(candidate => candidate.id !== deviceId));
      closeOperation('sign-out-device');
    });
  }, [closeOperation, device, runMutation]);

  const openSignOutAllDevices = useCallback(() => {
    setSignOutAllDevices({ isSubmitting: false, errors: {} });
  }, []);
  const submitSignOutAllDevices = useCallback(() => {
    if (signOutAllDevices?.isSubmitting) {
      return;
    }
    void runMutation('sign-out-all-devices', () => {
      setDevices(current => current.filter(candidate => candidate.isCurrent));
      closeOperation('sign-out-all-devices');
    });
  }, [closeOperation, runMutation, signOutAllDevices?.isSubmitting]);
  const signOutOtherSessions = useCallback(() => {
    setDevices(current => current.filter(candidate => candidate.isCurrent));
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
    devices,
    device,
    signOutAllDevices,
    reverification,
    openDevice,
    closeDevice: () => closeOperation('sign-out-device'),
    requestSignOutDevice,
    cancelSignOutDevice,
    submitSignOutDevice,
    openSignOutAllDevices,
    closeSignOutAllDevices: () => closeOperation('sign-out-all-devices'),
    submitSignOutAllDevices,
    signOutOtherSessions,
    updateVerificationValue,
    submitVerification,
    resendReverification,
    cancelReverification,
  };
}
