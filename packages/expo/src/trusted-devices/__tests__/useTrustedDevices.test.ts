import { beforeEach, describe, expect, test, vi } from 'vitest';

import { isTrustedDeviceError } from '../errors';
import { useTrustedDevices as useTrustedDevicesOnUnsupportedPlatform } from '../useTrustedDevices';
import { useTrustedDevices as useTrustedDevicesOnAndroid } from '../useTrustedDevices.android';
import { useTrustedDevices as useTrustedDevicesOnIos } from '../useTrustedDevices.ios';

const mocks = vi.hoisted(() => ({
  nativeModule: {
    getTrustedDeviceAvailability: vi.fn(),
    listTrustedDevices: vi.fn(),
    enrollTrustedDevice: vi.fn(),
    revokeTrustedDevice: vi.fn(),
    signInWithTrustedDevice: vi.fn(),
  },
}));

vi.mock('../../utils/native-module', () => ({
  ClerkExpoModule: mocks.nativeModule,
}));

vi.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

const nativeTrustedDevice = {
  id: 'td_123',
  object: 'trusted_device' as const,
  platform: 'ios' as const,
  appIdentifier: 'com.example.app',
  name: "Sean's iPhone",
  algorithm: 'ES256' as const,
  status: 'active' as const,
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_100_000,
  lastUsedAt: 1_700_000_200_000,
  revokedAt: null,
};

describe('useTrustedDevices on iOS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('checks availability for an optional credential selector', async () => {
    mocks.nativeModule.getTrustedDeviceAvailability.mockResolvedValue({
      isAvailable: true,
      unavailableReason: null,
    });

    const trustedDevices = useTrustedDevicesOnIos();
    const availability = await trustedDevices.getAvailability({
      id: 'td_123',
      identifierHint: 'sean@example.com',
    });

    expect(mocks.nativeModule.getTrustedDeviceAvailability).toHaveBeenCalledWith('td_123', 'sean@example.com');
    expect(availability).toEqual({ isAvailable: true, unavailableReason: null });
  });

  test('lists trusted devices and converts native timestamps to dates', async () => {
    mocks.nativeModule.listTrustedDevices.mockResolvedValue([nativeTrustedDevice]);

    const [trustedDevice] = await useTrustedDevicesOnIos().list();

    expect(trustedDevice).toEqual({
      ...nativeTrustedDevice,
      createdAt: new Date(nativeTrustedDevice.createdAt),
      updatedAt: new Date(nativeTrustedDevice.updatedAt),
      lastUsedAt: new Date(nativeTrustedDevice.lastUsedAt),
      revokedAt: null,
    });
  });

  test('maps omitted optional native timestamps to null', async () => {
    mocks.nativeModule.listTrustedDevices.mockResolvedValue([
      {
        ...nativeTrustedDevice,
        lastUsedAt: undefined,
        revokedAt: undefined,
      },
    ]);

    const [trustedDevice] = await useTrustedDevicesOnIos().list();

    expect(trustedDevice.lastUsedAt).toBeNull();
    expect(trustedDevice.revokedAt).toBeNull();
  });

  test('returns stable operation identities', () => {
    expect(useTrustedDevicesOnIos()).toBe(useTrustedDevicesOnIos());
  });

  test('enrolls with the safe default authentication policy', async () => {
    mocks.nativeModule.enrollTrustedDevice.mockResolvedValue(nativeTrustedDevice);

    const trustedDevice = await useTrustedDevicesOnIos().enroll({
      deviceName: "Sean's iPhone",
      identifierHint: 'sean@example.com',
      reason: 'Use Face ID to trust this device.',
    });

    expect(mocks.nativeModule.enrollTrustedDevice).toHaveBeenCalledWith(
      "Sean's iPhone",
      'sean@example.com',
      'Use Face ID to trust this device.',
      'biometry_or_device_passcode',
    );
    expect(trustedDevice.createdAt).toEqual(new Date(nativeTrustedDevice.createdAt));
  });

  test('revokes a trusted device by ID', async () => {
    mocks.nativeModule.revokeTrustedDevice.mockResolvedValue({
      ...nativeTrustedDevice,
      status: 'revoked',
      revokedAt: 1_700_000_300_000,
    });

    const trustedDevice = await useTrustedDevicesOnIos().revoke('td_123');

    expect(mocks.nativeModule.revokeTrustedDevice).toHaveBeenCalledWith('td_123');
    expect(trustedDevice.status).toBe('revoked');
    expect(trustedDevice.revokedAt).toEqual(new Date(1_700_000_300_000));
  });

  test('signs in through the native one-shot trusted-device flow', async () => {
    mocks.nativeModule.signInWithTrustedDevice.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'sess_123',
    });

    const result = await useTrustedDevicesOnIos().signIn({
      identifierHint: 'sean@example.com',
      reason: 'Use Face ID to sign in.',
    });

    expect(mocks.nativeModule.signInWithTrustedDevice).toHaveBeenCalledWith(
      null,
      'sean@example.com',
      'Use Face ID to sign in.',
    );
    expect(result).toEqual({ status: 'complete', createdSessionId: 'sess_123' });
  });

  test('preserves forward-compatible native values', async () => {
    mocks.nativeModule.listTrustedDevices.mockResolvedValue([
      {
        ...nativeTrustedDevice,
        platform: 'visionos',
        algorithm: 'ES384',
        status: 'pending_review',
      },
    ]);
    mocks.nativeModule.signInWithTrustedDevice.mockResolvedValue({
      status: 'future_sign_in_status',
      createdSessionId: null,
    });

    const trustedDevices = useTrustedDevicesOnIos();
    const [device] = await trustedDevices.list();
    const signIn = await trustedDevices.signIn();

    expect(device).toMatchObject({
      platform: 'visionos',
      algorithm: 'ES384',
      status: 'pending_review',
    });
    expect(signIn.status).toBe('future_sign_in_status');
  });

  test('preserves structured native errors', async () => {
    const nativeError = Object.assign(new Error('Biometric authentication was canceled.'), {
      code: 'biometric_authentication_canceled',
    });
    mocks.nativeModule.signInWithTrustedDevice.mockRejectedValue(nativeError);

    const operation = useTrustedDevicesOnIos().signIn();

    await expect(operation).rejects.toBe(nativeError);
    await operation.catch(error => {
      expect(isTrustedDeviceError(error)).toBe(true);
      if (isTrustedDeviceError(error)) {
        expect(error.code).toBe('biometric_authentication_canceled');
      }
    });
  });

  test('explains that the development client must contain the native methods', async () => {
    const signInWithTrustedDevice = mocks.nativeModule.signInWithTrustedDevice;
    Object.assign(mocks.nativeModule, { signInWithTrustedDevice: undefined });

    try {
      await expect(useTrustedDevicesOnIos().signIn()).rejects.toThrow(
        'Biometric trusted devices require a development build containing a compatible version of @clerk/expo.',
      );
    } finally {
      Object.assign(mocks.nativeModule, { signInWithTrustedDevice });
    }
  });
});

describe('useTrustedDevices on Android', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('uses the native trusted-device bridge', async () => {
    mocks.nativeModule.getTrustedDeviceAvailability.mockResolvedValue({
      isAvailable: true,
      unavailableReason: null,
    });
    mocks.nativeModule.signInWithTrustedDevice.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'sess_android',
    });

    const trustedDevices = useTrustedDevicesOnAndroid();

    await expect(trustedDevices.getAvailability({ identifierHint: 'sean@example.com' })).resolves.toEqual({
      isAvailable: true,
      unavailableReason: null,
    });
    await expect(trustedDevices.signIn({ reason: 'Confirm your identity to sign in.' })).resolves.toEqual({
      status: 'complete',
      createdSessionId: 'sess_android',
    });
    expect(mocks.nativeModule.getTrustedDeviceAvailability).toHaveBeenCalledWith(null, 'sean@example.com');
    expect(mocks.nativeModule.signInWithTrustedDevice).toHaveBeenCalledWith(
      null,
      null,
      'Confirm your identity to sign in.',
    );
  });
});

describe('useTrustedDevices on unsupported platforms', () => {
  test('returns stable operation identities', () => {
    expect(useTrustedDevicesOnUnsupportedPlatform()).toBe(useTrustedDevicesOnUnsupportedPlatform());
  });

  test('reports unsupported availability without invoking native code', async () => {
    const availability = await useTrustedDevicesOnUnsupportedPlatform().getAvailability();

    expect(availability).toEqual({
      isAvailable: false,
      unavailableReason: 'unsupported_platform',
    });
  });

  test('rejects operations that require the native implementation', async () => {
    await expect(useTrustedDevicesOnUnsupportedPlatform().enroll()).rejects.toThrow(
      'Biometric trusted devices are currently only available on iOS and Android.',
    );
  });
});
