import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useBiometricCredentials as useIos } from '../useBiometricCredentials.ios';
import { useBiometricCredentials as useAndroid } from '../useBiometricCredentials.android';
import { useBiometricCredentials as useUnsupported } from '../useBiometricCredentials';

const mocks = vi.hoisted(() => ({
  useClerk: vi.fn(),
  getClerkInstance: vi.fn(),
  wait: vi.fn(),
  availability: vi.fn(),
  list: vi.fn(),
  enroll: vi.fn(),
  revoke: vi.fn(),
  biometricCredential: vi.fn(),
  setActive: vi.fn(),
}));
vi.mock('react-native', () => ({ Platform: { OS: 'ios' } }));
vi.mock('@clerk/react', () => ({ useClerk: mocks.useClerk }));
vi.mock('../../provider/singleton', () => ({ getClerkInstance: mocks.getClerkInstance }));
vi.mock('../../provider/nativeResourceConnection', () => ({ waitForNativeResources: mocks.wait }));

const credential = {
  id: 'credential-one',
  object: 'trusted_device',
  platform: 'ios',
  appIdentifier: 'application',
  name: null,
  algorithm: 'ES256',
  status: 'active',
  createdAt: new Date(1700000000000),
  updatedAt: new Date(1700000001000),
  lastUsedAt: null,
  revokedAt: null,
};
let future: { status: string; createdSessionId: string | null; biometricCredential: typeof mocks.biometricCredential };
let legacy: { id: string };
let owner: {
  client: { signIn: typeof legacy } | null;
  setActive: typeof mocks.setActive;
  __internal_getMobileResources: () => unknown;
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.wait.mockResolvedValue(undefined);
  mocks.availability.mockResolvedValue({ isAvailable: true, unavailableReason: null });
  mocks.list.mockResolvedValue([credential]);
  mocks.enroll.mockResolvedValue(credential);
  mocks.revoke.mockResolvedValue({ ...credential, status: 'revoked' });
  mocks.biometricCredential.mockResolvedValue({ error: null });
  legacy = { id: 'sign-in-one' };
  future = { status: 'complete', createdSessionId: 'session-one', biometricCredential: mocks.biometricCredential };
  owner = {
    client: { signIn: legacy },
    setActive: mocks.setActive,
    __internal_getMobileResources: () => ({
      signIn: future,
      biometricCredentials: {
        availability: mocks.availability,
        list: mocks.list,
        enroll: mocks.enroll,
        revoke: mocks.revoke,
      },
    }),
  };
  mocks.useClerk.mockReturnValue(owner);
  mocks.getClerkInstance.mockReturnValue(owner);
});

for (const [platform, useHook] of [
  ['iOS', useIos],
  ['Android', useAndroid],
] as const) {
  describe(`biometric credentials on ${platform}`, () => {
    test('uses the existing resource and preserves dates, nullable fields, and unknown-value normalization', async () => {
      mocks.list.mockResolvedValue([{ ...credential, platform: 'future-platform', status: 'future-status' }]);
      const { result } = renderHook(useHook);
      const list = await result.current.list();
      expect(list).toEqual([{ ...credential, platform: 'unknown', status: 'unknown' }]);
      expect(list[0].createdAt).toBe(credential.createdAt);
    });
    test('waits for the native host before invoking a resource operation', async () => {
      let ready!: () => void;
      mocks.wait.mockReturnValue(
        new Promise<void>(resolve => {
          ready = resolve;
        }),
      );
      const { result } = renderHook(useHook);
      const availability = result.current.getAvailability({ id: 'credential-one' });
      await Promise.resolve();
      expect(mocks.availability).not.toHaveBeenCalled();
      ready();
      expect(await availability).toEqual({ isAvailable: true, unavailableReason: null });
      expect(mocks.availability).toHaveBeenCalledWith({ id: 'credential-one' });
    });
    test('preserves structured errors when native resources are unavailable', async () => {
      const error = Object.assign(new Error('unavailable'), { code: 'environment_unavailable' });
      mocks.wait.mockRejectedValue(error);
      const { result } = renderHook(useHook);
      await expect(result.current.list()).rejects.toBe(error);
      expect(mocks.list).not.toHaveBeenCalled();
    });
    test('enrolls with the safe default policy and revokes by credential ID', async () => {
      const { result } = renderHook(useHook);
      await result.current.enroll({ name: 'My device' });
      expect(mocks.enroll).toHaveBeenCalledWith({ name: 'My device', policy: 'biometry_or_device_passcode' });
      expect((await result.current.revoke('credential-one')).status).toBe('revoked');
      expect(mocks.revoke).toHaveBeenCalledWith({ id: 'credential-one' });
    });
    test('preserves a remaining factor and the existing JS sign-in object without activating a session', async () => {
      future.status = 'needs_second_factor';
      future.createdSessionId = null;
      const { result } = renderHook(useHook);
      const signIn = await result.current.signIn({ reason: 'Continue' });
      expect(signIn).toMatchObject({
        status: 'needs_second_factor',
        createdSessionId: null,
        signIn: legacy,
        setActive: mocks.setActive,
      });
      expect(mocks.setActive).not.toHaveBeenCalled();
    });
    test('returns a completed attempt for explicit activation and throws returned Clerk errors', async () => {
      const { result } = renderHook(useHook);
      expect(await result.current.signIn()).toMatchObject({ status: 'complete', createdSessionId: 'session-one' });
      expect(mocks.setActive).not.toHaveBeenCalled();
      const error = Object.assign(new Error('invalid'), { code: 'credential_revoked' });
      mocks.biometricCredential.mockResolvedValue({ error });
      await expect(result.current.signIn()).rejects.toBe(error);
    });
    test('rejects a provider change while the native host is becoming ready', async () => {
      mocks.wait.mockImplementation(async () => {
        mocks.getClerkInstance.mockReturnValue({ ...owner });
      });
      const { result } = renderHook(useHook);
      await expect(result.current.signIn()).rejects.toThrow('provider changed');
      expect(mocks.biometricCredential).not.toHaveBeenCalled();
    });
    test('keeps stable operation identities for an unchanged provider', () => {
      const hook = renderHook(useHook),
        first = hook.result.current;
      hook.rerender();
      expect(hook.result.current).toBe(first);
    });
    test('normalizes availability reasons for the existing Expo API', async () => {
      mocks.availability.mockResolvedValue({ isAvailable: false, unavailableReason: 'localKeyMissing' });
      const { result } = renderHook(useHook);
      expect(await result.current.getAvailability()).toEqual({
        isAvailable: false,
        unavailableReason: 'local_key_missing',
      });
    });
  });
}

describe('unsupported platforms', () => {
  test('reports unsupported availability and rejects native-only operations', async () => {
    const { result } = renderHook(useUnsupported);
    expect(await result.current.getAvailability()).toEqual({
      isAvailable: false,
      unavailableReason: 'unsupported_platform',
    });
    await expect(result.current.list()).rejects.toThrow();
    await expect(result.current.enroll()).rejects.toThrow();
    await expect(result.current.revoke('credential-one')).rejects.toThrow();
    await expect(result.current.signIn()).rejects.toThrow();
  });
});
