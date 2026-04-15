/**
 * Tests for the ClerkProvider native init effect: configures the native SDK
 * on launch, polls for a native session, then setActive on the JS clerk
 * instance once one appears (or 3 seconds elapse).
 *
 * This is the heaviest test in the suite — see the plan's "Risks" section for
 * the trade-offs we accepted with the heavy mocking.
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
    client: { sessions: [] },
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

describe('ClerkProvider native init flow', () => {
  test('on iOS with a publishableKey, calls ClerkExpo.configure once', async () => {
    renderProvider();
    await waitFor(() => expect(mocks.ClerkExpoModule.configure).toHaveBeenCalledTimes(1));
  });

  test('reads the JS bearer token from the token cache and passes it to configure', async () => {
    mocks.defaultGetToken.mockResolvedValueOnce('the_token');
    renderProvider();
    await waitFor(() => expect(mocks.ClerkExpoModule.configure).toHaveBeenCalledWith(PK, 'the_token'));
  });

  test('handles a token cache rejection by passing null to configure', async () => {
    mocks.defaultGetToken.mockRejectedValueOnce(new Error('decryption failed'));
    renderProvider();
    await waitFor(() => expect(mocks.ClerkExpoModule.configure).toHaveBeenCalledWith(PK, null));
  });

  test('user-provided tokenCache prop is honored', async () => {
    const customGet = vi.fn().mockResolvedValue('custom_token');
    renderProvider({ tokenCache: { getToken: customGet, saveToken: vi.fn() } });
    await waitFor(() => expect(mocks.ClerkExpoModule.configure).toHaveBeenCalledWith(PK, 'custom_token'));
    expect(mocks.defaultGetToken).not.toHaveBeenCalled();
  });

  test('polls getSession until a session arrives, then calls setActive', async () => {
    // First few polls return null, then a session
    mocks.ClerkExpoModule.getSession = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ sessionId: 'sess_x' });
    mockClerk.client.sessions = [{ id: 'sess_x' }];

    renderProvider();
    await waitFor(() => expect(mockClerk.setActive).toHaveBeenCalledWith({ session: 'sess_x' }), {
      timeout: 5000,
    });
  });

  test('iOS shape: { sessionId } is normalized', async () => {
    mocks.ClerkExpoModule.getSession.mockResolvedValueOnce({ sessionId: 'sess_ios' });
    mockClerk.client.sessions = [{ id: 'sess_ios' }];

    renderProvider();
    await waitFor(() => expect(mockClerk.setActive).toHaveBeenCalledWith({ session: 'sess_ios' }));
  });

  test('Android shape: { session: { id } } is normalized', async () => {
    mocks.ClerkExpoModule.getSession.mockResolvedValueOnce({ session: { id: 'sess_android' } });
    mockClerk.client.sessions = [{ id: 'sess_android' }];

    renderProvider();
    await waitFor(() => expect(mockClerk.setActive).toHaveBeenCalledWith({ session: 'sess_android' }));
  });

  test('session NOT in client.sessions: calls __internal_reloadInitialResources before setActive', async () => {
    mocks.ClerkExpoModule.getSession.mockResolvedValueOnce({ sessionId: 'sess_unknown' });
    mockClerk.client.sessions = [{ id: 'other' }];

    renderProvider();
    await waitFor(() => expect(mockClerk.setActive).toHaveBeenCalled());
    expect(mockClerk.__internal_reloadInitialResources).toHaveBeenCalled();
  });

  test('session IS in client.sessions: does NOT call __internal_reloadInitialResources', async () => {
    mocks.ClerkExpoModule.getSession.mockResolvedValueOnce({ sessionId: 'sess_x' });
    mockClerk.client.sessions = [{ id: 'sess_x' }];

    renderProvider();
    await waitFor(() => expect(mockClerk.setActive).toHaveBeenCalled());
    expect(mockClerk.__internal_reloadInitialResources).not.toHaveBeenCalled();
  });

  test('addOnLoaded path: when clerk is not loaded, registers a callback and waits', async () => {
    mockClerk.loaded = false;
    let registeredCallback: (() => void) | null = null;
    mockClerk.addOnLoaded = vi.fn(cb => {
      registeredCallback = cb;
    });
    mocks.ClerkExpoModule.getSession.mockResolvedValueOnce({ sessionId: 'sess_x' });
    mockClerk.client.sessions = [{ id: 'sess_x' }];

    renderProvider();
    await waitFor(() => expect(mockClerk.addOnLoaded).toHaveBeenCalled());
    expect(mockClerk.setActive).not.toHaveBeenCalled();

    // Fire the callback
    registeredCallback!();
    await waitFor(() => expect(mockClerk.setActive).toHaveBeenCalledWith({ session: 'sess_x' }));
  });

  test('setActive rejection is swallowed and logged', async () => {
    mockClerk.setActive.mockRejectedValueOnce(new Error('boom'));
    mocks.ClerkExpoModule.getSession.mockResolvedValueOnce({ sessionId: 'sess_x' });
    mockClerk.client.sessions = [{ id: 'sess_x' }];

    expect(() => renderProvider()).not.toThrow();
    await waitFor(() => expect(mockClerk.setActive).toHaveBeenCalled());
  });

  test('isNativeModuleNotFound error path: configure rejects with TurboModuleRegistry error', async () => {
    mocks.ClerkExpoModule.configure.mockRejectedValueOnce(new Error("Cannot find native module 'ClerkExpo'"));

    expect(() => renderProvider()).not.toThrow();
    await waitFor(() => expect(mocks.ClerkExpoModule.configure).toHaveBeenCalled());
    // Should NOT have proceeded to polling
    expect(mockClerk.setActive).not.toHaveBeenCalled();
  });

  test('generic configure error path: logs but does not crash', async () => {
    mocks.ClerkExpoModule.configure.mockRejectedValueOnce(new Error('something else'));

    expect(() => renderProvider()).not.toThrow();
    await waitFor(() => expect(mocks.ClerkExpoModule.configure).toHaveBeenCalled());
    expect(mockClerk.setActive).not.toHaveBeenCalled();
  });

  test('web platform: skips the native init flow entirely', async () => {
    mocks.Platform.OS = 'web';
    mocks.isNative = false;

    renderProvider();
    // Give microtasks a chance to flush
    await new Promise(r => setTimeout(r, 50));
    expect(mocks.ClerkExpoModule.configure).not.toHaveBeenCalled();
  });

  test('publishable key change re-runs the init flow', async () => {
    const { rerender } = renderProvider();
    await waitFor(() => expect(mocks.ClerkExpoModule.configure).toHaveBeenCalledTimes(1));

    rerender(
      React.createElement(ClerkProvider, { publishableKey: 'pk_test_y' }, React.createElement('div', null, 'child')),
    );
    await waitFor(() => expect(mocks.ClerkExpoModule.configure).toHaveBeenCalledTimes(2));
  });

  test('unmount during async init does not crash with state-on-unmounted-component', async () => {
    // Make getSession hang forever so the polling loop is in flight at unmount time
    mocks.ClerkExpoModule.getSession.mockImplementation(() => new Promise(() => {}));

    const { unmount } = renderProvider();
    await waitFor(() => expect(mocks.ClerkExpoModule.configure).toHaveBeenCalled());
    unmount();
    // No crash and no setActive call
    expect(mockClerk.setActive).not.toHaveBeenCalled();
  });
});
