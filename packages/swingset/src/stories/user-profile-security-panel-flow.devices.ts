import type {
  UserProfileDeviceDetailsFlowState,
  UserProfileDeviceSignOutFlowState,
  UserProfileSignOutAllDevicesFlowState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import type { UserProfileDevice } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { SecurityFlowConfig } from './user-profile-security-panel-flow.config';
import type { SecurityReverificationFlow } from './user-profile-security-panel-flow.reverification';

type DevicesFlowSliceConfig = Pick<SecurityFlowConfig, 'failurePoint' | 'latencyMs' | 'requireReverification'>;
type DeviceOperation = 'sign-out-device' | 'sign-out-all-devices';
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useDevicesFlowSlice({
  config,
  reverificationFlow,
  initialDevices,
}: {
  config: DevicesFlowSliceConfig;
  reverificationFlow: SecurityReverificationFlow;
  initialDevices: UserProfileDevice[];
}) {
  const settingsRef = useRef(config);
  settingsRef.current = config;
  const [devices, setDevices] = useState(initialDevices);
  const [device, setDevice] = useState<UserProfileDeviceDetailsFlowState | null>(null);
  const [deviceSignOut, setDeviceSignOut] = useState<UserProfileDeviceSignOutFlowState | null>(null);
  const [signOutAllDevices, setSignOutAllDevices] = useState<UserProfileSignOutAllDevicesFlowState | null>(null);
  const deviceSignOutIdRef = useRef<string | null>(null);
  const pendingOperations = useRef(new Set<DeviceOperation>());
  const triggerRef = useRef<HTMLElement | null>(null);
  const captureTrigger = useCallback(() => {
    const active = document.activeElement;
    triggerRef.current = active instanceof HTMLElement ? active : null;
  }, []);

  useEffect(() => setDevices(initialDevices), [initialDevices]);

  const closeOperation = useCallback(
    (operation: DeviceOperation) => {
      reverificationFlow.cancelReverification(operation);
      if (operation === 'sign-out-device') {
        setDeviceSignOut(null);
        deviceSignOutIdRef.current = null;
      } else {
        setSignOutAllDevices(null);
      }
    },
    [reverificationFlow],
  );
  const setSubmitting = useCallback((operation: DeviceOperation, isSubmitting: boolean, formError?: string) => {
    const errors = formError ? { form: formError } : {};
    if (operation === 'sign-out-device') {
      const deviceId = deviceSignOutIdRef.current;
      setDeviceSignOut(current => (current ? { ...current, isSubmitting, errors } : current));
      setDevice(current =>
        current && current.device.id === deviceId ? { ...current, isSubmitting, errors } : current,
      );
      setDevices(devices =>
        devices.map(candidate => (candidate.id === deviceId ? { ...candidate, isRevoking: isSubmitting } : candidate)),
      );
    } else {
      setSignOutAllDevices(current => (current ? { ...current, isSubmitting, errors } : current));
    }
  }, []);
  const runMutation = useCallback(
    async (operation: DeviceOperation, onSuccess: () => void) => {
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
          if (operation === 'sign-out-device') {
            setDeviceSignOut(null);
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
    [reverificationFlow, setSubmitting],
  );

  const openDevice = useCallback(
    (id: string) => {
      captureTrigger();
      const selected = devices.find(candidate => candidate.id === id);
      if (!selected || selected.isCurrent) {
        return;
      }
      setDevice({
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
    [captureTrigger, devices],
  );
  const signOutDevice = useCallback(
    (id: string) => {
      const selected = devices.find(candidate => candidate.id === id);
      if (!selected || selected.isCurrent || selected.isRevoking || pendingOperations.current.has('sign-out-device')) {
        return;
      }
      captureTrigger();
      deviceSignOutIdRef.current = id;
      setDeviceSignOut({ id, isSubmitting: true, errors: {} });
      setDevice(current => (current?.device.id === id ? { ...current, isSubmitting: true, errors: {} } : current));
      setDevices(current =>
        current.map(candidate => (candidate.id === id ? { ...candidate, isRevoking: true } : candidate)),
      );
      void runMutation('sign-out-device', () => {
        setDevices(current => current.filter(candidate => candidate.id !== id));
        setDevice(current => (current?.device.id === id ? null : current));
        closeOperation('sign-out-device');
      });
    },
    [captureTrigger, closeOperation, devices, runMutation],
  );

  const openSignOutAllDevices = useCallback(() => {
    captureTrigger();
    setSignOutAllDevices({ isSubmitting: false, errors: {} });
  }, [captureTrigger]);
  const submitSignOutAllDevices = useCallback(() => {
    if (signOutAllDevices?.isSubmitting || pendingOperations.current.has('sign-out-all-devices')) {
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

  return {
    triggerRef,
    devices,
    device,
    deviceSignOut,
    signOutAllDevices,
    openDevice,
    signOutDevice,
    closeDevice: () => {
      if (!device?.isSubmitting) {
        setDevice(null);
      }
    },
    openSignOutAllDevices,
    closeSignOutAllDevices: () => {
      if (!signOutAllDevices?.isSubmitting) {
        closeOperation('sign-out-all-devices');
      }
    },
    submitSignOutAllDevices,
    signOutOtherSessions,
  };
}
