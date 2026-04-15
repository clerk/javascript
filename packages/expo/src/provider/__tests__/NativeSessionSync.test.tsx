import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// The mocks object is created at hoist time. Note: mocks.ClerkExpoModule is
// a STABLE reference — we mutate its properties in beforeEach instead of
// reassigning it, because the vi.mock factory captures the reference once at
// module-import time.
const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  ClerkExpoModule: {
    configure: vi.fn(),
    getSession: vi.fn(),
    signOut: vi.fn(),
  },
  defaultGetToken: vi.fn(),
  defaultSaveToken: vi.fn(),
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  NativeModules: {},
  NativeEventEmitter: class {
    addListener() {
      return { remove: () => {} };
    }
  },
}));

// Polyfills module pulls in react-native-url-polyfill which touches NativeModules.
// We don't need polyfills for unit tests.
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
  isNative: () => true,
  isWeb: () => false,
}));

vi.mock('../../hooks/useNativeAuthEvents', () => ({
  useNativeAuthEvents: () => ({ nativeAuthState: null, isSupported: true }),
}));

vi.mock('../singleton', () => ({
  getClerkInstance: () => ({
    setActive: vi.fn(),
    addOnLoaded: vi.fn(),
    loaded: true,
    publishableKey: 'pk_test_x',
    client: { sessions: [] },
  }),
}));

import { NativeSessionSync } from '../ClerkProvider';

beforeEach(() => {
  vi.clearAllMocks();
  // Reset method behaviors on the SAME object reference
  mocks.ClerkExpoModule.configure = vi.fn().mockResolvedValue(undefined);
  mocks.ClerkExpoModule.getSession = vi.fn().mockResolvedValue(null);
  mocks.ClerkExpoModule.signOut = vi.fn().mockResolvedValue(undefined);
  mocks.defaultGetToken.mockResolvedValue(null);
  mocks.defaultSaveToken.mockResolvedValue(undefined);
  mocks.useAuth.mockReturnValue({ isSignedIn: false });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const PK = 'pk_test_x';

describe('NativeSessionSync', () => {
  test('signed-out: clears the native session by calling ClerkExpo.signOut', async () => {
    mocks.useAuth.mockReturnValue({ isSignedIn: false });
    render(React.createElement(NativeSessionSync, { publishableKey: PK, tokenCache: undefined }));
    await waitFor(() => {
      expect(mocks.ClerkExpoModule.signOut).toHaveBeenCalled();
    });
  });

  test('signed-in + native already has a session: does NOT call configure', async () => {
    mocks.useAuth.mockReturnValue({ isSignedIn: true });
    mocks.ClerkExpoModule.getSession.mockResolvedValue({ sessionId: 'sess_x' });

    render(React.createElement(NativeSessionSync, { publishableKey: PK, tokenCache: undefined }));
    await waitFor(() => expect(mocks.ClerkExpoModule.getSession).toHaveBeenCalled());

    expect(mocks.ClerkExpoModule.configure).not.toHaveBeenCalled();
  });

  test('signed-in + native has no session + token cache has a token: calls configure', async () => {
    mocks.useAuth.mockReturnValue({ isSignedIn: true });
    mocks.ClerkExpoModule.getSession.mockResolvedValue(null);
    mocks.defaultGetToken.mockResolvedValueOnce('the_token');

    render(React.createElement(NativeSessionSync, { publishableKey: PK, tokenCache: undefined }));
    await waitFor(() => expect(mocks.ClerkExpoModule.configure).toHaveBeenCalledWith(PK, 'the_token'));
  });

  test('signed-in + token cache empty: does NOT call configure', async () => {
    mocks.useAuth.mockReturnValue({ isSignedIn: true });
    mocks.ClerkExpoModule.getSession.mockResolvedValue(null);
    mocks.defaultGetToken.mockResolvedValue(null);

    render(React.createElement(NativeSessionSync, { publishableKey: PK, tokenCache: undefined }));
    await waitFor(() => expect(mocks.ClerkExpoModule.getSession).toHaveBeenCalled());
    expect(mocks.ClerkExpoModule.configure).not.toHaveBeenCalled();
  });

  test('user-provided tokenCache overrides the default', async () => {
    const customGet = vi.fn().mockResolvedValue('custom_token');
    const customSave = vi.fn();
    mocks.useAuth.mockReturnValue({ isSignedIn: true });
    mocks.ClerkExpoModule.getSession.mockResolvedValue(null);

    render(
      React.createElement(NativeSessionSync, {
        publishableKey: PK,
        tokenCache: { getToken: customGet, saveToken: customSave },
      }),
    );

    await waitFor(() => expect(mocks.ClerkExpoModule.configure).toHaveBeenCalledWith(PK, 'custom_token'));
    expect(customGet).toHaveBeenCalled();
    expect(mocks.defaultGetToken).not.toHaveBeenCalled();
  });

  test('Android shape: { session: { id } } is treated as a session', async () => {
    mocks.useAuth.mockReturnValue({ isSignedIn: true });
    mocks.ClerkExpoModule.getSession.mockResolvedValue({ session: { id: 'sess_y' } });

    render(React.createElement(NativeSessionSync, { publishableKey: PK, tokenCache: undefined }));
    await waitFor(() => expect(mocks.ClerkExpoModule.getSession).toHaveBeenCalled());

    // hasNativeSession is true → no configure
    expect(mocks.ClerkExpoModule.configure).not.toHaveBeenCalled();
  });

  test('errors in the sync flow are caught and do not propagate', async () => {
    mocks.useAuth.mockReturnValue({ isSignedIn: true });
    mocks.ClerkExpoModule.getSession.mockRejectedValueOnce(new Error('boom'));

    expect(() => {
      render(React.createElement(NativeSessionSync, { publishableKey: PK, tokenCache: undefined }));
    }).not.toThrow();

    await waitFor(() => expect(mocks.ClerkExpoModule.getSession).toHaveBeenCalled());
    // Should not crash; configure should not have been called
    expect(mocks.ClerkExpoModule.configure).not.toHaveBeenCalled();
  });

  test('signed-in -> signed-out transition resets hasSyncedRef and triggers signOut', async () => {
    // First mount signed-in with a native session
    mocks.useAuth.mockReturnValue({ isSignedIn: true });
    mocks.ClerkExpoModule.getSession.mockResolvedValue({ sessionId: 'sess_x' });

    const { rerender } = render(React.createElement(NativeSessionSync, { publishableKey: PK, tokenCache: undefined }));
    await waitFor(() => expect(mocks.ClerkExpoModule.getSession).toHaveBeenCalled());

    // Now flip to signed-out
    mocks.useAuth.mockReturnValue({ isSignedIn: false });
    rerender(React.createElement(NativeSessionSync, { publishableKey: PK, tokenCache: undefined }));

    await waitFor(() => expect(mocks.ClerkExpoModule.signOut).toHaveBeenCalled());
  });
});
