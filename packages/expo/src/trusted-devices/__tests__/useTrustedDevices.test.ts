import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { isBiometricCredentialError } from '../../biometric-credentials/errors';
import { isTrustedDeviceError } from '../errors';
import { useTrustedDevices as useTrustedDevicesOnUnsupportedPlatform } from '../useTrustedDevices';
import { useTrustedDevices as useTrustedDevicesOnAndroid } from '../useTrustedDevices.android';
import { useTrustedDevices as useTrustedDevicesOnIos } from '../useTrustedDevices.ios';

const mocks = vi.hoisted(() => ({
  deprecated: vi.fn(),
  biometricCredentials: {
    getAvailability: vi.fn(),
    list: vi.fn(),
    enroll: vi.fn(),
    revoke: vi.fn(),
    signIn: vi.fn(),
  },
}));

vi.mock('@clerk/shared/deprecated', () => ({
  deprecated: mocks.deprecated,
}));

vi.mock('../../biometric-credentials/useBiometricCredentials.shared', () => ({
  useBiometricCredentials: () => mocks.biometricCredentials,
}));

vi.mock('../../biometric-credentials/useBiometricCredentials', () => ({
  useBiometricCredentials: () => mocks.biometricCredentials,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe.each([
  ['iOS', useTrustedDevicesOnIos],
  ['Android', useTrustedDevicesOnAndroid],
  ['an unsupported platform', useTrustedDevicesOnUnsupportedPlatform],
])('useTrustedDevices on %s', (_, useTrustedDevices) => {
  test('warns that the hook is deprecated', () => {
    renderHook(() => useTrustedDevices());

    expect(mocks.deprecated).toHaveBeenCalledWith('useTrustedDevices', 'Use `useBiometricCredentials()` instead.');
  });

  test('translates deviceName to name when enrolling', async () => {
    const credential = { id: 'td_123' };
    mocks.biometricCredentials.enroll.mockResolvedValue(credential);

    const { result } = renderHook(() => useTrustedDevices());
    await expect(
      result.current.enroll({
        deviceName: "Sean's iPhone",
        identifierHint: 'sean@example.com',
        reason: 'Confirm enrollment',
        policy: 'biometry_current_set',
      }),
    ).resolves.toBe(credential);

    expect(mocks.biometricCredentials.enroll).toHaveBeenCalledWith({
      name: "Sean's iPhone",
      identifierHint: 'sean@example.com',
      reason: 'Confirm enrollment',
      policy: 'biometry_current_set',
    });
  });

  test('forwards undefined when enrolling without parameters', async () => {
    const credential = { id: 'td_123' };
    mocks.biometricCredentials.enroll.mockResolvedValue(credential);

    const { result } = renderHook(() => useTrustedDevices());
    await expect(result.current.enroll()).resolves.toBe(credential);

    expect(mocks.biometricCredentials.enroll).toHaveBeenCalledWith(undefined);
  });

  test('preserves the other trusted-device operations', () => {
    const { result } = renderHook(() => useTrustedDevices());

    expect(result.current.getAvailability).toBe(mocks.biometricCredentials.getAvailability);
    expect(result.current.list).toBe(mocks.biometricCredentials.list);
    expect(result.current.revoke).toBe(mocks.biometricCredentials.revoke);
    expect(result.current.signIn).toBe(mocks.biometricCredentials.signIn);
  });
});

test('keeps the trusted-device error guard behavior', () => {
  const error = Object.assign(new Error('Unavailable'), { code: 'environment_unavailable' });
  const nonError = { code: 'environment_unavailable' };

  expect(isTrustedDeviceError(error)).toBe(isBiometricCredentialError(error));
  expect(isTrustedDeviceError(nonError)).toBe(isBiometricCredentialError(nonError));
});
