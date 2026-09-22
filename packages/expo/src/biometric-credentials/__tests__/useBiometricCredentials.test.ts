import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  __internal_resetNativeClientSyncCoordinator,
  registerNativeToJsSyncHandler,
  trackPendingJsToNativeSync,
} from '../../provider/nativeClientSyncCoordinator';
import { isBiometricCredentialError } from '../errors';
import { useBiometricCredentials as useBiometricCredentialsOnUnsupportedPlatform } from '../useBiometricCredentials';
import { useBiometricCredentials as useBiometricCredentialsOnAndroid } from '../useBiometricCredentials.android';
import { useBiometricCredentials as useBiometricCredentialsOnIos } from '../useBiometricCredentials.ios';

const mocks = vi.hoisted(() => ({
  jsSignIn: {
    id: 'sia_123',
    status: 'complete',
    createdSessionId: 'sess_123',
    prepareSecondFactor: vi.fn(),
    attemptSecondFactor: vi.fn(),
    resetPassword: vi.fn(),
  },
  jsSignedInSessions: [{ id: 'sess_123' }],
  useClerk: vi.fn(),
  setActive: vi.fn(),
  synchronizeNativeClientToJs: vi.fn(),
  nativeModule: {
    getTrustedDeviceAvailability: vi.fn(),
    listTrustedDevices: vi.fn(),
    enrollTrustedDevice: vi.fn(),
    revokeTrustedDevice: vi.fn(),
    signInWithTrustedDevice: vi.fn(),
  },
}));

vi.mock('@clerk/react', () => ({
  useClerk: mocks.useClerk,
}));

vi.mock('../../utils/native-module', () => ({
  ClerkExpoModule: mocks.nativeModule,
}));

vi.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

const nativeBiometricCredential = {
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

function renderBiometricCredentials(useHook = useBiometricCredentialsOnIos) {
  return renderHook(() => useHook()).result.current;
}

let unregisterNativeToJsSyncHandler: (() => void) | undefined;

beforeEach(() => {
  __internal_resetNativeClientSyncCoordinator();
  unregisterNativeToJsSyncHandler = registerNativeToJsSyncHandler(mocks.synchronizeNativeClientToJs);
  mocks.synchronizeNativeClientToJs.mockResolvedValue(undefined);
  mocks.useClerk.mockReturnValue({
    client: { signIn: mocks.jsSignIn, signedInSessions: mocks.jsSignedInSessions },
    setActive: mocks.setActive,
  });
  Object.assign(mocks.jsSignIn, {
    id: 'sia_123',
    status: 'complete',
    createdSessionId: 'sess_123',
  });
  mocks.jsSignedInSessions.splice(0, mocks.jsSignedInSessions.length, { id: 'sess_123' });
});

afterEach(() => {
  vi.useRealTimers();
  unregisterNativeToJsSyncHandler?.();
});

describe('useBiometricCredentials on iOS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('checks availability for an optional credential selector', async () => {
    mocks.nativeModule.getTrustedDeviceAvailability.mockResolvedValue({
      isAvailable: true,
      unavailableReason: null,
    });

    const biometricCredentials = renderBiometricCredentials();
    const availability = await biometricCredentials.getAvailability({
      id: 'td_123',
      identifierHint: 'sean@example.com',
    });

    expect(mocks.nativeModule.getTrustedDeviceAvailability).toHaveBeenCalledWith('td_123', 'sean@example.com');
    expect(availability).toEqual({ isAvailable: true, unavailableReason: null });
  });

  test('waits for native client synchronization before checking availability', async () => {
    let finishNativeSync!: () => void;
    const nativeSync = new Promise<void>(resolve => {
      finishNativeSync = resolve;
    });
    trackPendingJsToNativeSync(nativeSync);
    mocks.nativeModule.getTrustedDeviceAvailability.mockResolvedValue({
      isAvailable: true,
      unavailableReason: null,
    });

    const availability = renderBiometricCredentials().getAvailability();
    await Promise.resolve();

    expect(mocks.nativeModule.getTrustedDeviceAvailability).not.toHaveBeenCalled();

    finishNativeSync();
    await expect(availability).resolves.toEqual({ isAvailable: true, unavailableReason: null });
    expect(mocks.nativeModule.getTrustedDeviceAvailability).toHaveBeenCalledTimes(1);
  });

  test('rejects availability when native client synchronization times out', async () => {
    vi.useFakeTimers();
    let finishNativeSync!: () => void;
    const nativeSync = new Promise<void>(resolve => {
      finishNativeSync = resolve;
    });
    trackPendingJsToNativeSync(nativeSync);

    const availability = expect(renderBiometricCredentials().getAvailability()).rejects.toMatchObject({
      code: 'environment_unavailable',
    });

    await vi.advanceTimersByTimeAsync(5_000);
    await availability;
    expect(mocks.nativeModule.getTrustedDeviceAvailability).not.toHaveBeenCalled();
    finishNativeSync();
  });

  test('lists biometric credentials and converts native timestamps to dates', async () => {
    mocks.nativeModule.listTrustedDevices.mockResolvedValue([nativeBiometricCredential]);

    const [biometricCredential] = await renderBiometricCredentials().list();

    expect(biometricCredential).toEqual({
      ...nativeBiometricCredential,
      createdAt: new Date(nativeBiometricCredential.createdAt),
      updatedAt: new Date(nativeBiometricCredential.updatedAt),
      lastUsedAt: new Date(nativeBiometricCredential.lastUsedAt),
      revokedAt: null,
    });
  });

  test('maps omitted optional native timestamps to null', async () => {
    mocks.nativeModule.listTrustedDevices.mockResolvedValue([
      {
        ...nativeBiometricCredential,
        lastUsedAt: undefined,
        revokedAt: undefined,
      },
    ]);

    const [biometricCredential] = await renderBiometricCredentials().list();

    expect(biometricCredential.lastUsedAt).toBeNull();
    expect(biometricCredential.revokedAt).toBeNull();
  });

  test('waits for native client synchronization before listing biometric credentials', async () => {
    let finishNativeSync!: () => void;
    const nativeSync = new Promise<void>(resolve => {
      finishNativeSync = resolve;
    });
    trackPendingJsToNativeSync(nativeSync);
    mocks.nativeModule.listTrustedDevices.mockResolvedValue([nativeBiometricCredential]);

    const listing = renderBiometricCredentials().list();
    await Promise.resolve();

    expect(mocks.nativeModule.listTrustedDevices).not.toHaveBeenCalled();

    finishNativeSync();
    await expect(listing).resolves.toHaveLength(1);
    expect(mocks.nativeModule.listTrustedDevices).toHaveBeenCalledTimes(1);
  });

  test('returns stable operation identities', () => {
    const { result, rerender } = renderHook(() => useBiometricCredentialsOnIos());
    const initialBiometricCredentials = result.current;

    rerender();

    expect(result.current).toBe(initialBiometricCredentials);
  });

  test('enrolls with the safe default authentication policy', async () => {
    mocks.nativeModule.enrollTrustedDevice.mockResolvedValue(nativeBiometricCredential);

    const biometricCredential = await renderBiometricCredentials().enroll({
      name: "Sean's iPhone",
      identifierHint: 'sean@example.com',
      reason: 'Use Face ID to trust this device.',
    });

    expect(mocks.nativeModule.enrollTrustedDevice).toHaveBeenCalledWith(
      "Sean's iPhone",
      'sean@example.com',
      'Use Face ID to trust this device.',
      'biometry_or_device_passcode',
    );
    expect(biometricCredential.createdAt).toEqual(new Date(nativeBiometricCredential.createdAt));
  });

  test('waits for native client synchronization before enrollment', async () => {
    let finishNativeSync!: () => void;
    const nativeSync = new Promise<void>(resolve => {
      finishNativeSync = resolve;
    });
    trackPendingJsToNativeSync(nativeSync);
    mocks.nativeModule.enrollTrustedDevice.mockResolvedValue(nativeBiometricCredential);

    const enrollment = renderBiometricCredentials().enroll();
    await Promise.resolve();

    expect(mocks.nativeModule.enrollTrustedDevice).not.toHaveBeenCalled();

    finishNativeSync();
    await expect(enrollment).resolves.toMatchObject({ id: 'td_123' });
    expect(mocks.nativeModule.enrollTrustedDevice).toHaveBeenCalledTimes(1);
  });

  test('revokes a biometric credential by ID', async () => {
    mocks.nativeModule.revokeTrustedDevice.mockResolvedValue({
      ...nativeBiometricCredential,
      status: 'revoked',
      revokedAt: 1_700_000_300_000,
    });

    const biometricCredential = await renderBiometricCredentials().revoke('td_123');

    expect(mocks.nativeModule.revokeTrustedDevice).toHaveBeenCalledWith('td_123');
    expect(biometricCredential.status).toBe('revoked');
    expect(biometricCredential.revokedAt).toEqual(new Date(1_700_000_300_000));
  });

  test('waits for native client synchronization before revoking a biometric credential', async () => {
    let finishNativeSync!: () => void;
    const nativeSync = new Promise<void>(resolve => {
      finishNativeSync = resolve;
    });
    trackPendingJsToNativeSync(nativeSync);
    mocks.nativeModule.revokeTrustedDevice.mockResolvedValue({
      ...nativeBiometricCredential,
      status: 'revoked',
    });

    const revocation = renderBiometricCredentials().revoke('td_123');
    await Promise.resolve();

    expect(mocks.nativeModule.revokeTrustedDevice).not.toHaveBeenCalled();

    finishNativeSync();
    await expect(revocation).resolves.toMatchObject({ id: 'td_123', status: 'revoked' });
    expect(mocks.nativeModule.revokeTrustedDevice).toHaveBeenCalledWith('td_123');
  });

  test('signs in through the native one-shot biometric-credential flow', async () => {
    mocks.nativeModule.signInWithTrustedDevice.mockResolvedValue({
      id: 'sia_123',
      status: 'complete',
      createdSessionId: 'sess_123',
    });

    const result = await renderBiometricCredentials().signIn({
      identifierHint: 'sean@example.com',
      reason: 'Use Face ID to sign in.',
    });

    expect(mocks.nativeModule.signInWithTrustedDevice).toHaveBeenCalledWith(
      null,
      'sean@example.com',
      'Use Face ID to sign in.',
    );
    expect(result).toMatchObject({
      status: 'complete',
      createdSessionId: 'sess_123',
      signIn: mocks.jsSignIn,
    });
    expect(result.setActive).toBe(mocks.setActive);
  });

  test('keeps a completed native result authoritative when the current JS sign-in changes', async () => {
    mocks.nativeModule.signInWithTrustedDevice.mockResolvedValue({
      id: 'sia_native',
      status: 'complete',
      createdSessionId: 'sess_123',
    });
    Object.assign(mocks.jsSignIn, {
      id: 'sia_other',
      status: 'needs_second_factor',
      createdSessionId: 'sess_other',
    });

    const result = await renderBiometricCredentials().signIn();

    expect(result).toMatchObject({
      status: 'complete',
      createdSessionId: 'sess_123',
      signIn: mocks.jsSignIn,
    });
  });

  test('accepts a completed sign-in when the synchronized client only contains its session', async () => {
    mocks.nativeModule.signInWithTrustedDevice.mockResolvedValue({
      id: 'sia_123',
      status: 'complete',
      createdSessionId: 'sess_123',
    });
    Object.assign(mocks.jsSignIn, {
      id: '',
      status: null,
      createdSessionId: null,
    });

    const result = await renderBiometricCredentials().signIn();

    expect(result).toMatchObject({
      status: 'complete',
      createdSessionId: 'sess_123',
      signIn: mocks.jsSignIn,
    });
  });

  test('rejects a completed sign-in when its session is absent after synchronization', async () => {
    mocks.nativeModule.signInWithTrustedDevice.mockResolvedValue({
      id: 'sia_123',
      status: 'complete',
      createdSessionId: 'sess_missing',
    });

    await expect(renderBiometricCredentials().signIn()).rejects.toThrow(
      'Unable to synchronize biometric sign-in with the Clerk JS client: the created session is missing.',
    );
  });

  test('waits for native client synchronization before biometric sign-in', async () => {
    let finishNativeSync!: () => void;
    const nativeSync = new Promise<void>(resolve => {
      finishNativeSync = resolve;
    });
    trackPendingJsToNativeSync(nativeSync);
    mocks.nativeModule.signInWithTrustedDevice.mockResolvedValue({
      id: 'sia_123',
      status: 'complete',
      createdSessionId: 'sess_123',
    });

    const signIn = renderBiometricCredentials().signIn();
    await Promise.resolve();

    expect(mocks.nativeModule.signInWithTrustedDevice).not.toHaveBeenCalled();

    finishNativeSync();
    await expect(signIn).resolves.toMatchObject({ status: 'complete', createdSessionId: 'sess_123' });
    expect(mocks.nativeModule.signInWithTrustedDevice).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['needs_second_factor', 'prepareSecondFactor'],
    ['needs_client_trust', 'attemptSecondFactor'],
    ['needs_new_password', 'resetPassword'],
  ] as const)('returns a continuable JS sign-in for %s', async (status, continuationMethod) => {
    mocks.nativeModule.signInWithTrustedDevice.mockResolvedValue({
      id: 'sia_mfa',
      status,
      createdSessionId: null,
    });
    mocks.synchronizeNativeClientToJs.mockImplementation(() => {
      Object.assign(mocks.jsSignIn, {
        id: 'sia_mfa',
        status,
        createdSessionId: null,
      });
      return Promise.resolve();
    });

    const result = await renderBiometricCredentials().signIn();

    expect(result).toMatchObject({
      status,
      createdSessionId: null,
      signIn: mocks.jsSignIn,
    });
    expect(result.signIn[continuationMethod]).toBe(mocks.jsSignIn[continuationMethod]);
  });

  test('does not resolve a completed sign-in before native-to-JS synchronization', async () => {
    let finishSync!: () => void;
    mocks.nativeModule.signInWithTrustedDevice.mockResolvedValue({
      id: 'sia_123',
      status: 'complete',
      createdSessionId: 'sess_123',
    });
    mocks.synchronizeNativeClientToJs.mockReturnValue(
      new Promise<void>(resolve => {
        finishSync = resolve;
      }),
    );

    let didResolve = false;
    const signIn = renderBiometricCredentials()
      .signIn()
      .then(result => {
        didResolve = true;
        return result;
      });
    await vi.waitFor(() => expect(mocks.synchronizeNativeClientToJs).toHaveBeenCalled());
    expect(didResolve).toBe(false);

    finishSync();
    await expect(signIn).resolves.toMatchObject({ createdSessionId: 'sess_123' });
  });

  test('rejects when native-to-JS synchronization returns a different sign-in attempt', async () => {
    mocks.nativeModule.signInWithTrustedDevice.mockResolvedValue({
      id: 'sia_native',
      status: 'needs_second_factor',
      createdSessionId: null,
    });
    Object.assign(mocks.jsSignIn, {
      id: 'sia_js',
      status: 'needs_second_factor',
      createdSessionId: null,
    });

    await expect(renderBiometricCredentials().signIn()).rejects.toThrow(
      'Unable to synchronize biometric sign-in with the Clerk JS client: the sign-in attempt does not match.',
    );
  });

  test('uses the Clerk instance from the React provider after synchronization', async () => {
    const providerSetActive = vi.fn();
    const providerSignIn = {
      ...mocks.jsSignIn,
      id: 'sia_provider',
    };
    mocks.nativeModule.signInWithTrustedDevice.mockResolvedValue({
      id: 'sia_provider',
      status: 'complete',
      createdSessionId: 'sess_provider',
    });
    mocks.useClerk.mockReturnValue({
      client: {
        signIn: providerSignIn,
        signedInSessions: [{ id: 'sess_provider' }],
      },
      setActive: providerSetActive,
    });

    const result = await renderBiometricCredentials().signIn();

    expect(result.signIn).toBe(providerSignIn);
    expect(result.setActive).toBe(providerSetActive);
  });

  test('rejects when the Clerk JS client is unavailable after synchronization', async () => {
    mocks.nativeModule.signInWithTrustedDevice.mockResolvedValue({
      id: 'sia_native',
      status: 'complete',
      createdSessionId: 'sess_native',
    });
    mocks.useClerk.mockReturnValue({
      client: undefined,
      setActive: mocks.setActive,
    });

    await expect(renderBiometricCredentials().signIn()).rejects.toThrow(
      'Unable to synchronize biometric sign-in with the Clerk JS client: the client sign-in resource is unavailable.',
    );
  });

  test('normalizes unknown resource values and preserves the synchronized JS sign-in status', async () => {
    mocks.nativeModule.listTrustedDevices.mockResolvedValue([
      {
        ...nativeBiometricCredential,
        platform: 'visionos',
        algorithm: 'ES384',
        status: 'pending_review',
      },
    ]);
    mocks.nativeModule.signInWithTrustedDevice.mockResolvedValue({
      id: 'sia_future',
      status: 'future_sign_in_status',
      createdSessionId: null,
    });
    Object.assign(mocks.jsSignIn, {
      id: 'sia_future',
      status: 'future_sign_in_status',
      createdSessionId: null,
    });

    const biometricCredentials = renderBiometricCredentials();
    const [device] = await biometricCredentials.list();
    const signIn = await biometricCredentials.signIn();

    expect(device).toMatchObject({
      platform: 'unknown',
      algorithm: 'ES384',
      status: 'unknown',
    });
    expect(signIn.status).toBe('future_sign_in_status');
  });

  test('preserves structured native errors', async () => {
    const nativeError = Object.assign(new Error('Biometric authentication was canceled.'), {
      code: 'biometric_authentication_canceled',
    });
    mocks.nativeModule.signInWithTrustedDevice.mockRejectedValue(nativeError);

    const operation = renderBiometricCredentials().signIn();

    await expect(operation).rejects.toBe(nativeError);
    await operation.catch(error => {
      expect(isBiometricCredentialError(error)).toBe(true);
      if (isBiometricCredentialError(error)) {
        expect(error.code).toBe('biometric_authentication_canceled');
      }
    });
  });

  test('explains that the development client must contain the native methods', async () => {
    const signInWithTrustedDevice = mocks.nativeModule.signInWithTrustedDevice;
    Object.assign(mocks.nativeModule, { signInWithTrustedDevice: undefined });

    try {
      await expect(renderBiometricCredentials().signIn()).rejects.toThrow(
        'Biometric credentials require a development build containing a compatible version of @clerk/expo.',
      );
    } finally {
      Object.assign(mocks.nativeModule, { signInWithTrustedDevice });
    }
  });
});

describe('useBiometricCredentials on Android', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('uses the native biometric-credential bridge', async () => {
    mocks.nativeModule.getTrustedDeviceAvailability.mockResolvedValue({
      isAvailable: true,
      unavailableReason: null,
    });
    mocks.nativeModule.signInWithTrustedDevice.mockResolvedValue({
      id: 'sia_android',
      status: 'complete',
      createdSessionId: 'sess_android',
    });
    Object.assign(mocks.jsSignIn, {
      id: 'sia_android',
      status: 'complete',
      createdSessionId: 'sess_android',
    });
    mocks.jsSignedInSessions.splice(0, mocks.jsSignedInSessions.length, { id: 'sess_android' });

    const biometricCredentials = renderBiometricCredentials(useBiometricCredentialsOnAndroid);

    await expect(biometricCredentials.getAvailability({ identifierHint: 'sean@example.com' })).resolves.toEqual({
      isAvailable: true,
      unavailableReason: null,
    });
    await expect(biometricCredentials.signIn({ reason: 'Confirm your identity to sign in.' })).resolves.toMatchObject({
      status: 'complete',
      createdSessionId: 'sess_android',
      signIn: mocks.jsSignIn,
    });
    expect(mocks.nativeModule.getTrustedDeviceAvailability).toHaveBeenCalledWith(null, 'sean@example.com');
    expect(mocks.nativeModule.signInWithTrustedDevice).toHaveBeenCalledWith(
      null,
      null,
      'Confirm your identity to sign in.',
    );
  });
});

describe('useBiometricCredentials on unsupported platforms', () => {
  test('returns stable operation identities', () => {
    const { result, rerender } = renderHook(() => useBiometricCredentialsOnUnsupportedPlatform());
    const biometricCredentials = result.current;

    rerender();

    expect(result.current).toBe(biometricCredentials);
  });

  test('reports unsupported availability without invoking native code', async () => {
    const biometricCredentials = renderBiometricCredentials(useBiometricCredentialsOnUnsupportedPlatform);
    const availability = await biometricCredentials.getAvailability();

    expect(availability).toEqual({
      isAvailable: false,
      unavailableReason: 'unsupported_platform',
    });
  });

  test('rejects operations that require the native implementation', async () => {
    const biometricCredentials = renderBiometricCredentials(useBiometricCredentialsOnUnsupportedPlatform);

    await expect(biometricCredentials.enroll()).rejects.toThrow(
      'Biometric credentials are currently only available on iOS and Android.',
    );
  });
});
