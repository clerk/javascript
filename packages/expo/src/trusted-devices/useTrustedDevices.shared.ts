import { synchronizeNativeClientToJs, waitForPendingJsToNativeSync } from '../provider/nativeClientSyncCoordinator';
import { getClerkInstance } from '../provider/singleton';
import type { NativeTrustedDevice, NativeTrustedDeviceModule } from '../specs/NativeClerkModule.types';
import { errorThrower } from '../utils/errors';
import { ClerkExpoModule } from '../utils/native-module';
import type { TrustedDevice, TrustedDevicePlatform, TrustedDeviceStatus, UseTrustedDevicesReturn } from './types';

const DEFAULT_POLICY = 'biometry_or_device_passcode';

function toTrustedDevicePlatform(platform: string): TrustedDevicePlatform {
  return platform === 'ios' || platform === 'android' ? platform : 'unknown';
}

function toTrustedDeviceStatus(status: string): TrustedDeviceStatus {
  return status === 'active' || status === 'revoked' ? status : 'unknown';
}

function getNativeModule(): NativeTrustedDeviceModule {
  const nativeModule = ClerkExpoModule;

  if (
    !nativeModule?.getTrustedDeviceAvailability ||
    !nativeModule.listTrustedDevices ||
    !nativeModule.enrollTrustedDevice ||
    !nativeModule.revokeTrustedDevice ||
    !nativeModule.signInWithTrustedDevice
  ) {
    return errorThrower.throw(
      'Biometric trusted devices require a development build containing a compatible version of @clerk/expo.',
    );
  }

  return nativeModule as NativeTrustedDeviceModule;
}

function toTrustedDevice(device: NativeTrustedDevice): TrustedDevice {
  return {
    ...device,
    platform: toTrustedDevicePlatform(device.platform),
    status: toTrustedDeviceStatus(device.status),
    createdAt: new Date(device.createdAt),
    updatedAt: new Date(device.updatedAt),
    lastUsedAt: device.lastUsedAt == null ? null : new Date(device.lastUsedAt),
    revokedAt: device.revokedAt == null ? null : new Date(device.revokedAt),
  };
}

const trustedDevices: UseTrustedDevicesReturn = Object.freeze({
  getAvailability: async params => {
    const nativeModule = getNativeModule();
    await waitForPendingJsToNativeSync();
    return nativeModule.getTrustedDeviceAvailability(params?.id ?? null, params?.identifierHint ?? null);
  },
  list: async () => {
    const nativeModule = getNativeModule();
    await waitForPendingJsToNativeSync();
    const devices = await nativeModule.listTrustedDevices();
    return devices.map(toTrustedDevice);
  },
  enroll: async params => {
    const nativeModule = getNativeModule();
    await waitForPendingJsToNativeSync();
    const device = await nativeModule.enrollTrustedDevice(
      params?.deviceName ?? null,
      params?.identifierHint ?? null,
      params?.reason ?? null,
      params?.policy ?? DEFAULT_POLICY,
    );
    return toTrustedDevice(device);
  },
  revoke: async id => {
    const nativeModule = getNativeModule();
    await waitForPendingJsToNativeSync();
    const device = await nativeModule.revokeTrustedDevice(id);
    return toTrustedDevice(device);
  },
  signIn: async params => {
    const nativeModule = getNativeModule();
    await waitForPendingJsToNativeSync();
    const nativeSignIn = await nativeModule.signInWithTrustedDevice(
      params?.id ?? null,
      params?.identifierHint ?? null,
      params?.reason ?? null,
    );
    await synchronizeNativeClientToJs();

    const clerk = getClerkInstance();
    if (!clerk) {
      return errorThrower.throw(
        'Unable to synchronize the trusted-device sign-in with the Clerk JS client: the Clerk instance is unavailable.',
      );
    }

    const client = clerk.client;
    const signIn = client?.signIn;
    if (!client || !signIn) {
      return errorThrower.throw(
        'Unable to synchronize the trusted-device sign-in with the Clerk JS client: the client sign-in resource is unavailable.',
      );
    }

    if (nativeSignIn.status === 'complete') {
      if (
        !nativeSignIn.createdSessionId ||
        !client.signedInSessions.some(session => session.id === nativeSignIn.createdSessionId)
      ) {
        return errorThrower.throw(
          'Unable to synchronize the trusted-device sign-in with the Clerk JS client: the created session is missing.',
        );
      }
    } else if (!signIn.id || signIn.id !== nativeSignIn.id) {
      return errorThrower.throw(
        'Unable to synchronize the trusted-device sign-in with the Clerk JS client: the sign-in attempt does not match.',
      );
    }

    return {
      status: signIn.status ?? nativeSignIn.status,
      createdSessionId: signIn.createdSessionId ?? nativeSignIn.createdSessionId,
      signIn,
      setActive: clerk.setActive,
    };
  },
});

/**
 * Accesses biometric trusted-device enrollment and sign-in on iOS and Android.
 *
 * The private key and biometric prompt are managed by Clerk's native SDK.
 */
export function useTrustedDevices(): UseTrustedDevicesReturn {
  return trustedDevices;
}
