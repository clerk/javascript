import type { NativeTrustedDevice, NativeTrustedDeviceModule } from '../specs/NativeClerkModule.types';
import { errorThrower } from '../utils/errors';
import { ClerkExpoModule } from '../utils/native-module';
import type { TrustedDevice, UseTrustedDevicesReturn } from './types';

const DEFAULT_POLICY = 'biometry_or_device_passcode';

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
    createdAt: new Date(device.createdAt),
    updatedAt: new Date(device.updatedAt),
    lastUsedAt: device.lastUsedAt === null ? null : new Date(device.lastUsedAt),
    revokedAt: device.revokedAt === null ? null : new Date(device.revokedAt),
  };
}

/**
 * Accesses biometric trusted-device enrollment and sign-in on iOS and Android.
 *
 * The private key and biometric prompt are managed by Clerk's native SDK.
 */
export function useTrustedDevices(): UseTrustedDevicesReturn {
  return {
    getAvailability: params =>
      Promise.resolve().then(() =>
        getNativeModule().getTrustedDeviceAvailability(params?.id ?? null, params?.identifierHint ?? null),
      ),
    list: async () => {
      const devices = await getNativeModule().listTrustedDevices();
      return devices.map(toTrustedDevice);
    },
    enroll: async params => {
      const device = await getNativeModule().enrollTrustedDevice(
        params?.deviceName ?? null,
        params?.identifierHint ?? null,
        params?.reason ?? null,
        params?.policy ?? DEFAULT_POLICY,
      );
      return toTrustedDevice(device);
    },
    revoke: async id => {
      const device = await getNativeModule().revokeTrustedDevice(id);
      return toTrustedDevice(device);
    },
    signIn: params =>
      Promise.resolve().then(() =>
        getNativeModule().signInWithTrustedDevice(
          params?.id ?? null,
          params?.identifierHint ?? null,
          params?.reason ?? null,
        ),
      ),
  };
}
