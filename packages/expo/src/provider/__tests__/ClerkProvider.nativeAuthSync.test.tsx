/**
 * Tests for the useEffect in ClerkProvider that watches `nativeAuthState`
 * (returned from useNativeAuthEvents) and syncs the native auth event to
 * the JS SDK via setActive / signOut.
 *
 * We test this by rendering <ClerkProvider> with a controllable
 * useNativeAuthEvents mock and asserting which clerk methods get called.
 */
import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn().mockReturnValue({ isSignedIn: false }),
  ClerkExpoModule: {
    configure: vi.fn(),
    getSession: vi.fn(),
    signOut: vi.fn(),
    getClientToken: vi.fn(),
  },
  defaultGetToken: vi.fn(),
  defaultSaveToken: vi.fn(),
  getClerkInstance: vi.fn(),
  useNativeAuthEvents: vi.fn().mockReturnValue({ nativeAuthState: null, isSupported: true }),
  isNative: true,
  Platform: { OS: 'ios' as 'ios' | 'web' | 'android' },
}));

vi.mock('react-native', () => ({
  get Platform() {
    return mocks.Platform;
  },
  NativeModules: {},
  NativeEventEmitter: class {
    addListener() {
      return { remove: () => {} };
    }
  },
}));

vi.mock('../../polyfills', () => ({}));

vi.mock('@clerk/react', () => ({
  useAuth: mocks.useAuth,
}));

vi.mock('@clerk/react/internal', () => ({
  InternalClerkProvider: ({ children }: any) => children,
}));

vi.mock('../../specs/NativeClerkModule', () => ({
  default: mocks.ClerkExpoModule,
}));

vi.mock('../../token-cache', () => ({
  tokenCache: {
    getToken: mocks.defaultGetToken,
    saveToken: mocks.defaultSaveToken,
  },
}));

vi.mock('../../utils/runtime', () => ({
  get isNative() {
    return () => mocks.isNative;
  },
  get isWeb() {
    return () => !mocks.isNative;
  },
}));

vi.mock('../../hooks/useNativeAuthEvents', () => ({
  useNativeAuthEvents: mocks.useNativeAuthEvents,
}));

vi.mock('../singleton', () => ({
  getClerkInstance: mocks.getClerkInstance,
}));

import { ClerkProvider } from '../ClerkProvider';

const PK = 'pk_test_x';

let mockClerk: {
  setActive: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  __internal_reloadInitialResources: ReturnType<typeof vi.fn>;
  loaded: boolean;
  addOnLoaded: ReturnType<typeof vi.fn>;
  publishableKey: string;
  client: { sessions: { id: string }[] };
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.Platform.OS = 'ios';
  mocks.isNative = true;
  mocks.ClerkExpoModule.configure = vi.fn().mockResolvedValue(undefined);
  // Default to null so the polling init effect in ClerkProvider doesn't itself
  // trigger a setActive — these tests target the OTHER useEffect that watches
  // nativeAuthState. Tests that need a polled session can override.
  mocks.ClerkExpoModule.getSession = vi.fn().mockResolvedValue(null);
  mocks.ClerkExpoModule.signOut = vi.fn().mockResolvedValue(undefined);
  mocks.ClerkExpoModule.getClientToken = vi.fn().mockResolvedValue(null);
  mocks.defaultGetToken.mockResolvedValue(null);
  mocks.defaultSaveToken.mockResolvedValue(undefined);
  mocks.useAuth.mockReturnValue({ isSignedIn: false });
  mocks.useNativeAuthEvents.mockReturnValue({ nativeAuthState: null, isSupported: true });

  mockClerk = {
    setActive: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    __internal_reloadInitialResources: vi.fn().mockResolvedValue(undefined),
    loaded: true,
    addOnLoaded: vi.fn(),
    publishableKey: PK,
    client: { sessions: [{ id: 'sess_x' }] },
  };
  mocks.getClerkInstance.mockReturnValue(mockClerk);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const renderProvider = (overrides: Record<string, any> = {}) =>
  render(
    React.createElement(ClerkProvider, { publishableKey: PK, ...overrides }, React.createElement('div', null, 'child')),
  );

describe('ClerkProvider native -> JS auth sync', () => {
  test('nativeAuthState=null does not trigger any sync', async () => {
    mocks.useNativeAuthEvents.mockReturnValue({ nativeAuthState: null, isSupported: true });
    renderProvider();
    await waitFor(() => expect(mocks.getClerkInstance).toHaveBeenCalled());
    expect(mockClerk.setActive).not.toHaveBeenCalled();
    expect(mockClerk.signOut).not.toHaveBeenCalled();
  });

  test('signedIn event with session already in client: setActive is called WITHOUT a reload', async () => {
    mocks.useNativeAuthEvents.mockReturnValue({
      nativeAuthState: { type: 'signedIn', sessionId: 'sess_x' },
      isSupported: true,
    });
    mockClerk.client.sessions = [{ id: 'sess_x' }];

    renderProvider();
    await waitFor(() => expect(mockClerk.setActive).toHaveBeenCalledWith({ session: 'sess_x' }));
    expect(mockClerk.__internal_reloadInitialResources).not.toHaveBeenCalled();
  });

  test('signedIn event with session NOT in client: reloads first then setActive', async () => {
    mocks.useNativeAuthEvents.mockReturnValue({
      nativeAuthState: { type: 'signedIn', sessionId: 'sess_y' },
      isSupported: true,
    });
    mockClerk.client.sessions = [{ id: 'other' }];

    renderProvider();
    await waitFor(() => expect(mockClerk.setActive).toHaveBeenCalledWith({ session: 'sess_y' }));
    expect(mockClerk.__internal_reloadInitialResources).toHaveBeenCalled();
  });

  test('signedIn event copies the native client token to the token cache', async () => {
    mocks.useNativeAuthEvents.mockReturnValue({
      nativeAuthState: { type: 'signedIn', sessionId: 'sess_x' },
      isSupported: true,
    });
    mocks.ClerkExpoModule.getClientToken = vi.fn().mockResolvedValue('native_client_token');

    renderProvider();
    await waitFor(() =>
      expect(mocks.defaultSaveToken).toHaveBeenCalledWith('__clerk_client_jwt', 'native_client_token'),
    );
  });

  test('signedIn event when getClientToken returns null skips the token cache write', async () => {
    mocks.useNativeAuthEvents.mockReturnValue({
      nativeAuthState: { type: 'signedIn', sessionId: 'sess_x' },
      isSupported: true,
    });
    mocks.ClerkExpoModule.getClientToken = vi.fn().mockResolvedValue(null);

    renderProvider();
    await waitFor(() => expect(mockClerk.setActive).toHaveBeenCalled());
    expect(mocks.defaultSaveToken).not.toHaveBeenCalled();
  });

  test('signedOut event calls clerk.signOut()', async () => {
    mocks.useNativeAuthEvents.mockReturnValue({
      nativeAuthState: { type: 'signedOut', sessionId: null },
      isSupported: true,
    });

    renderProvider();
    await waitFor(() => expect(mockClerk.signOut).toHaveBeenCalled());
    expect(mockClerk.setActive).not.toHaveBeenCalled();
  });

  test('user-provided tokenCache prop is honored over the default', async () => {
    const customSave = vi.fn().mockResolvedValue(undefined);
    const customGet = vi.fn().mockResolvedValue(null);
    mocks.useNativeAuthEvents.mockReturnValue({
      nativeAuthState: { type: 'signedIn', sessionId: 'sess_x' },
      isSupported: true,
    });
    mocks.ClerkExpoModule.getClientToken = vi.fn().mockResolvedValue('native_client_token');

    renderProvider({ tokenCache: { getToken: customGet, saveToken: customSave } });

    await waitFor(() => expect(customSave).toHaveBeenCalledWith('__clerk_client_jwt', 'native_client_token'));
    expect(mocks.defaultSaveToken).not.toHaveBeenCalled();
  });

  test('setActive rejection is swallowed and does not crash the provider', async () => {
    mockClerk.setActive.mockRejectedValueOnce(new Error('boom'));
    mocks.useNativeAuthEvents.mockReturnValue({
      nativeAuthState: { type: 'signedIn', sessionId: 'sess_x' },
      isSupported: true,
    });

    expect(() => renderProvider()).not.toThrow();
    await waitFor(() => expect(mockClerk.setActive).toHaveBeenCalled());
  });
});
