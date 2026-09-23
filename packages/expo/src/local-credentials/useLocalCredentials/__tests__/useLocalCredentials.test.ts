import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useLocalCredentials } from '../useLocalCredentials';

const mocks = vi.hoisted(() => ({
  publishableKey: 'pk_test_Zm9vLmNsZXJrLmFjY291bnRzLmRldiQ',
  store: new Map<string, string>(),
  rejectProtectedWrites: false,
  signIn: { create: vi.fn() },
}));

vi.mock('@clerk/react', () => ({
  useClerk: () => ({ publishableKey: mocks.publishableKey }),
  useUser: () => ({ user: null }),
}));

vi.mock('@clerk/react/legacy', () => ({
  useSignIn: () => ({ isLoaded: true, signIn: mocks.signIn }),
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

vi.mock('../../../utils/native-module', () => ({
  ClerkExpoModule: {},
}));

vi.mock('expo-local-authentication', () => ({
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
  isEnrolledAsync: () => Promise.resolve(true),
  supportedAuthenticationTypesAsync: () => Promise.resolve([]),
}));

vi.mock('expo-secure-store', () => ({
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 0,
  getItem: (key: string) => mocks.store.get(key) ?? null,
  getItemAsync: (key: string) => Promise.resolve(mocks.store.get(key) ?? null),
  deleteItemAsync: (key: string) => {
    mocks.store.delete(key);
    return Promise.resolve();
  },
  setItemAsync: (key: string, value: string, options?: { requireAuthentication?: boolean }) => {
    if (options?.requireAuthentication && mocks.rejectProtectedWrites) {
      return Promise.reject(new Error('User canceled the authentication'));
    }
    mocks.store.set(key, value);
    return Promise.resolve();
  },
}));

const identifierKey = `__clerk_local_auth_${mocks.publishableKey}_identifier`;
const passwordKey = `__clerk_local_auth_${mocks.publishableKey}_password`;

beforeEach(() => {
  mocks.store.clear();
  mocks.rejectProtectedWrites = false;
});

describe('useLocalCredentials', () => {
  test('reports credentials once both writes succeed', async () => {
    const { result } = renderHook(() => useLocalCredentials());

    await act(() => result.current.setCredentials({ identifier: 'user@example.com', password: 'hunter2' }));

    expect(result.current.hasCredentials).toBe(true);
    expect(mocks.store.get(identifierKey)).toBe('user@example.com');
    expect(mocks.store.get(passwordKey)).toBe('hunter2');
  });

  test('does not report credentials when the biometric prompt is cancelled', async () => {
    mocks.rejectProtectedWrites = true;
    const { result } = renderHook(() => useLocalCredentials());

    await act(async () => {
      await expect(
        result.current.setCredentials({ identifier: 'user@example.com', password: 'hunter2' }),
      ).rejects.toThrow('User canceled the authentication');
    });

    expect(result.current.hasCredentials).toBe(false);
    expect(mocks.store.has(identifierKey)).toBe(false);
    expect(mocks.store.has(passwordKey)).toBe(false);

    const remounted = renderHook(() => useLocalCredentials());
    expect(remounted.result.current.hasCredentials).toBe(false);
  });

  test('keeps the existing credentials when a password update is cancelled', async () => {
    mocks.store.set(identifierKey, 'user@example.com');
    mocks.store.set(passwordKey, 'hunter2');
    mocks.rejectProtectedWrites = true;
    const { result } = renderHook(() => useLocalCredentials());

    await act(async () => {
      await expect(result.current.setCredentials({ password: 'new-password' })).rejects.toThrow();
    });

    expect(result.current.hasCredentials).toBe(true);
    expect(mocks.store.get(identifierKey)).toBe('user@example.com');
    expect(mocks.store.get(passwordKey)).toBe('hunter2');
  });

  test('rejects a password update when no identifier is stored', async () => {
    const { result } = renderHook(() => useLocalCredentials());

    await act(async () => {
      await expect(result.current.setCredentials({ password: 'hunter2' })).rejects.toThrow(
        'an identifier should already be set',
      );
    });

    expect(result.current.hasCredentials).toBe(false);
    expect(mocks.store.has(passwordKey)).toBe(false);
  });
});
