import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  __internal_resetNativeClientSyncCoordinator,
  registerNativeToJsSyncHandler,
  trackPendingJsToNativeSync,
} from '../../provider/nativeClientSyncCoordinator';
import { useBiometricCredentials as useUnsupportedBiometrics } from '../useBiometricCredentials';
import { useBiometricCredentials as useAndroidBiometrics } from '../useBiometricCredentials.android';
import { useBiometricCredentials as useIosBiometrics } from '../useBiometricCredentials.ios';

const mocks = vi.hoisted(() => ({
  useClerk: vi.fn(),
  nativeModule: {
    getTrustedDeviceAvailability: vi.fn(),
    listTrustedDevices: vi.fn(),
    enrollTrustedDevice: vi.fn(),
    revokeTrustedDevice: vi.fn(),
    signInWithTrustedDevice: vi.fn(),
    reverifyWithBiometrics: vi.fn(),
  },
}));

vi.mock('@clerk/react', () => ({ useClerk: mocks.useClerk }));
vi.mock('../../utils/native-module', () => ({ ClerkExpoModule: mocks.nativeModule }));
vi.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

const session = {
  id: 'sess_123',
  clearCache: vi.fn(),
  getToken: vi.fn(),
};
const clerk = { session: session as typeof session | null, setActive: vi.fn() };
const synchronize = vi.fn();
let unregister: () => void;

beforeEach(() => {
  vi.resetAllMocks();
  __internal_resetNativeClientSyncCoordinator();
  unregister = registerNativeToJsSyncHandler(synchronize);
  clerk.session = session;
  mocks.useClerk.mockReturnValue(clerk);
  session.getToken.mockResolvedValue('fresh-token');
  mocks.nativeModule.reverifyWithBiometrics.mockResolvedValue({
    id: 'stepup_123',
    status: 'complete',
    level: 'first_factor',
    sessionId: session.id,
  });
});

afterEach(() => unregister());

describe.each([
  ['iOS', useIosBiometrics],
  ['Android', useAndroidBiometrics],
] as const)('biometric reverification on %s', (_platform, useBiometrics) => {
  test('refreshes the same session and forces a fresh token before completing', async () => {
    const { result } = renderHook(useBiometrics);

    await expect(result.current.reverify({ reason: 'Approve this change' })).resolves.toEqual({
      id: 'stepup_123',
      status: 'complete',
      level: 'first_factor',
      session,
    });
    expect(mocks.nativeModule.reverifyWithBiometrics).toHaveBeenCalledWith(
      session.id,
      'first_factor',
      'Approve this change',
    );
    expect(synchronize).toHaveBeenCalledOnce();
    expect(session.clearCache).toHaveBeenCalledTimes(2);
    expect(session.clearCache.mock.invocationCallOrder[0]).toBeLessThan(synchronize.mock.invocationCallOrder[0]);
    expect(session.getToken).toHaveBeenCalledWith({ skipCache: true });
    expect(synchronize.mock.invocationCallOrder[0]).toBeLessThan(session.getToken.mock.invocationCallOrder[0]);
    expect(clerk.setActive).not.toHaveBeenCalled();
    expect(mocks.nativeModule.signInWithTrustedDevice).not.toHaveBeenCalled();
  });

  test.each(['first_factor', 'second_factor', 'multi_factor'] as const)(
    'passes the requested %s requirement',
    async level => {
      const { result } = renderHook(useBiometrics);
      await result.current.reverify({ level });
      expect(mocks.nativeModule.reverifyWithBiometrics).toHaveBeenCalledWith(session.id, level, null);
    },
  );
});

test('returns the server level when it differs from the requested level', async () => {
  const { result } = renderHook(useIosBiometrics);
  await expect(result.current.reverify({ level: 'multi_factor' })).resolves.toMatchObject({ level: 'first_factor' });
});

test('incomplete verification returns the synchronized session without refreshing tokens', async () => {
  mocks.nativeModule.reverifyWithBiometrics.mockResolvedValue({
    id: 'stepup_123',
    status: 'needs_second_factor',
    level: 'multi_factor',
    sessionId: session.id,
  });
  const refreshedSession = { ...session };
  synchronize.mockImplementation(() => {
    clerk.session = refreshedSession;
  });
  const { result } = renderHook(useIosBiometrics);
  const verification = await result.current.reverify({ level: 'multi_factor' });
  expect(verification.status).toBe('needs_second_factor');
  expect(verification.session).toBe(refreshedSession);
  expect(session.clearCache).not.toHaveBeenCalled();
  expect(session.getToken).not.toHaveBeenCalled();
});

test('waits for pending JS-to-native synchronization', async () => {
  let finish!: () => void;
  trackPendingJsToNativeSync(
    new Promise<void>(resolve => {
      finish = resolve;
    }),
  );
  const { result } = renderHook(useIosBiometrics);
  const verification = result.current.reverify();
  await Promise.resolve();
  expect(mocks.nativeModule.reverifyWithBiometrics).not.toHaveBeenCalled();
  finish();
  await verification;
});

test('does not start a biometric operation after the active session changes during synchronization', async () => {
  let finish!: () => void;
  trackPendingJsToNativeSync(
    new Promise<void>(resolve => {
      finish = resolve;
    }),
  );
  const { result } = renderHook(useIosBiometrics);
  const verification = result.current.reverify();
  clerk.session = { ...session, id: 'sess_other' };
  finish();
  await expect(verification).rejects.toThrow('active session changed');
  expect(mocks.nativeModule.reverifyWithBiometrics).not.toHaveBeenCalled();
});

test.each(['biometric_authentication_canceled', 'biometric_credential_policy_incompatible', 'key_invalidated'])(
  'preserves the native %s error and leaves the session cache intact',
  async code => {
    const error = Object.assign(new Error(code), { code });
    mocks.nativeModule.reverifyWithBiometrics.mockRejectedValue(error);
    const { result } = renderHook(useAndroidBiometrics);
    await expect(result.current.reverify()).rejects.toBe(error);
    expect(session.clearCache).not.toHaveBeenCalled();
    expect(session.getToken).not.toHaveBeenCalled();
    expect(synchronize).not.toHaveBeenCalled();
  },
);

test('rejects a native result belonging to another session', async () => {
  mocks.nativeModule.reverifyWithBiometrics.mockResolvedValue({ status: 'complete', sessionId: 'sess_other' });
  const { result } = renderHook(useIosBiometrics);
  await expect(result.current.reverify()).rejects.toThrow('different session');
  expect(synchronize).not.toHaveBeenCalled();
});

test('does not refresh or activate another session if the active session changes', async () => {
  const otherSession = { ...session, id: 'sess_other', getToken: vi.fn() };
  synchronize.mockImplementation(() => {
    clerk.session = otherSession;
  });
  const { result } = renderHook(useIosBiometrics);
  await expect(result.current.reverify()).rejects.toThrow('active session changed');
  expect(otherSession.getToken).not.toHaveBeenCalled();
  expect(clerk.setActive).not.toHaveBeenCalled();
});

test('propagates synchronization failures after invalidating cached tokens', async () => {
  synchronize.mockRejectedValue(new Error('sync failed'));
  const { result } = renderHook(useIosBiometrics);
  await expect(result.current.reverify()).rejects.toThrow('sync failed');
  expect(session.clearCache).toHaveBeenCalledOnce();
  expect(session.getToken).not.toHaveBeenCalled();
});

test.each([null, 'failure'])('does not report success when token refresh returns %s', async outcome => {
  if (outcome === null) {
    session.getToken.mockResolvedValue(null);
  } else {
    session.getToken.mockRejectedValue(new Error('token refresh failed'));
  }
  const { result } = renderHook(useIosBiometrics);
  await expect(result.current.reverify()).rejects.toThrow();
});

test('requires an active session', async () => {
  clerk.session = null;
  const { result } = renderHook(useIosBiometrics);
  await expect(result.current.reverify()).rejects.toThrow('requires an active session');
  expect(mocks.nativeModule.reverifyWithBiometrics).not.toHaveBeenCalled();
});

test('rejects an invalid runtime level before starting verification', async () => {
  const { result } = renderHook(useIosBiometrics);
  await expect(result.current.reverify({ level: 'invalid' as 'first_factor' })).rejects.toThrow(
    'level must be first_factor, second_factor, or multi_factor',
  );
  expect(mocks.nativeModule.reverifyWithBiometrics).not.toHaveBeenCalled();
});

test('rejects completion if the active session changes while refreshing its token', async () => {
  let finish!: (token: string) => void;
  session.getToken.mockReturnValue(
    new Promise<string>(resolve => {
      finish = resolve;
    }),
  );
  const { result } = renderHook(useIosBiometrics);
  const verification = result.current.reverify();
  await vi.waitFor(() => expect(session.getToken).toHaveBeenCalled());
  clerk.session = { ...session, id: 'sess_other' };
  finish('fresh-token');
  await expect(verification).rejects.toThrow('active session changed');
  expect(clerk.setActive).not.toHaveBeenCalled();
});

test('older native builds keep existing operations but explain the missing reverification method', async () => {
  const reverify = mocks.nativeModule.reverifyWithBiometrics;
  Object.assign(mocks.nativeModule, { reverifyWithBiometrics: undefined });
  mocks.nativeModule.listTrustedDevices.mockResolvedValue([]);
  try {
    const { result } = renderHook(useIosBiometrics);
    await expect(result.current.list()).resolves.toEqual([]);
    await expect(result.current.reverify()).rejects.toThrow('Biometric reverification requires a development build');
  } finally {
    Object.assign(mocks.nativeModule, { reverifyWithBiometrics: reverify });
  }
});

test('unsupported platforms reject reverification', async () => {
  const { result } = renderHook(useUnsupportedBiometrics);
  await expect(result.current.reverify()).rejects.toThrow('only available on iOS and Android');
});
