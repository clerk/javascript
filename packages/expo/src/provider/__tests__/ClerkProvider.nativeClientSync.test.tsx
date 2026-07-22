import { act, render, waitFor } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { CLERK_CLIENT_JWT_KEY } from '../../constants';
import { ClerkProvider } from '../ClerkProvider';

const mocks = vi.hoisted(() => {
  return {
    configure: vi.fn(),
    getClientToken: vi.fn(),
    nativeClientEvent: null as unknown,
    syncClientStateFromJs: vi.fn(),
    tokenCache: {
      clearToken: vi.fn(),
      getToken: vi.fn(),
      saveToken: vi.fn(),
    },
    clerkOptions: undefined as
      | {
          tokenCache?: {
            clearToken: (key: string) => void | Promise<void>;
            getToken: (key: string) => Promise<string | null | undefined>;
            saveToken: (key: string, token: string) => Promise<void>;
          };
        }
      | undefined,
    clerkInstance: {
      __internal_reloadInitialResources: vi.fn(),
      addListener: vi.fn(),
      addOnLoaded: vi.fn(),
      client: undefined as unknown,
      handleUnauthenticated: vi.fn(),
      loaded: false,
      off: vi.fn(),
      on: vi.fn(),
      session: undefined as unknown,
      setActive: vi.fn(),
      status: 'loading',
      updateClient: vi.fn(),
    },
    clerkListener: undefined as (() => void) | undefined,
    clerkOnLoaded: undefined as (() => void) | undefined,
    clerkStatusListener: undefined as ((status: string) => void) | undefined,
  };
});

vi.mock('../../polyfills', () => ({}));

vi.mock('@clerk/react/internal', () => {
  return {
    InternalClerkProvider: ({ children }: { children: ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

vi.mock('react-native', () => {
  return {
    NativeModules: {
      BlobModule: {},
    },
    Platform: {
      OS: 'ios',
      constants: {
        reactNativeVersion: {
          major: 0,
          minor: 81,
          patch: 0,
        },
      },
    },
  };
});

vi.mock('expo-secure-store', () => {
  return {
    AFTER_FIRST_UNLOCK: 0,
    deleteItemAsync: vi.fn(),
    getItemAsync: vi.fn(),
    setItemAsync: vi.fn(),
  };
});

vi.mock('../../hooks/useNativeClientEvents', () => {
  return {
    useNativeClientEvents: () => ({
      nativeClientEvent: mocks.nativeClientEvent,
    }),
  };
});

vi.mock('../../specs/NativeClerkModule', () => {
  return {
    default: {
      addListener: vi.fn(),
      configure: mocks.configure,
      getClientToken: mocks.getClientToken,
      syncClientStateFromJs: mocks.syncClientStateFromJs,
    },
  };
});

vi.mock('../../utils/runtime', () => {
  return {
    isNative: () => true,
    isWeb: () => false,
  };
});

vi.mock('../singleton', () => {
  return {
    getClerkInstance: (options?: { tokenCache?: typeof mocks.tokenCache }) => {
      mocks.clerkOptions = options;
      return mocks.clerkInstance;
    },
  };
});

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void;
  const promise = new Promise<void>(innerResolve => {
    resolve = innerResolve;
  });
  return { promise, resolve };
}

describe('ClerkProvider native client sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.nativeClientEvent = null;
    mocks.configure.mockResolvedValue(undefined);
    mocks.getClientToken.mockResolvedValue(null);
    mocks.syncClientStateFromJs.mockResolvedValue(undefined);
    mocks.tokenCache.getToken.mockResolvedValue(null);
    mocks.tokenCache.saveToken.mockResolvedValue(undefined);
    mocks.tokenCache.clearToken.mockResolvedValue(undefined);
    mocks.clerkOptions = undefined;
    mocks.clerkInstance.__internal_reloadInitialResources.mockResolvedValue(undefined);
    mocks.clerkInstance.addOnLoaded = vi.fn();
    mocks.clerkInstance.client = undefined;
    mocks.clerkInstance.handleUnauthenticated = vi.fn().mockResolvedValue(undefined);
    mocks.clerkInstance.loaded = true;
    mocks.clerkInstance.off.mockReset();
    mocks.clerkInstance.on.mockReset();
    mocks.clerkInstance.session = undefined;
    mocks.clerkInstance.setActive.mockResolvedValue(undefined);
    mocks.clerkInstance.status = 'ready';
    mocks.clerkInstance.updateClient = vi.fn();
    mocks.clerkInstance.updateClient.mockImplementation(client => {
      mocks.clerkInstance.client = client;
      const currentSession = mocks.clerkInstance.session as { id?: string } | null | undefined;
      mocks.clerkInstance.session = currentSession
        ? client.signedInSessions.find((session: { id: string }) => session.id === currentSession.id) || null
        : currentSession;
    });
    mocks.clerkListener = undefined;
    mocks.clerkOnLoaded = undefined;
    mocks.clerkStatusListener = undefined;
    mocks.clerkInstance.addOnLoaded.mockImplementation(listener => {
      mocks.clerkOnLoaded = listener;
    });
    mocks.clerkInstance.addListener.mockImplementation(listener => {
      mocks.clerkListener = listener;
      return vi.fn();
    });
    mocks.clerkInstance.on.mockImplementation((event, listener) => {
      if (event === 'status') {
        mocks.clerkStatusListener = listener;
      }
    });
  });

  test('configures native once with the cached device token during StrictMode bootstrap', async () => {
    mocks.tokenCache.getToken.mockResolvedValue('client-token');
    mocks.getClientToken.mockResolvedValue('client-token');

    render(
      <React.StrictMode>
        <ClerkProvider
          publishableKey='pk_test_123'
          tokenCache={mocks.tokenCache}
        />
      </React.StrictMode>,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', 'client-token');
    });
    expect(mocks.configure).toHaveBeenCalledTimes(1);
    expect(mocks.syncClientStateFromJs).not.toHaveBeenCalled();
    expect(mocks.clerkInstance.__internal_reloadInitialResources).not.toHaveBeenCalled();
  });

  test('syncs the native device token to JS after Clerk loads during bootstrap', async () => {
    mocks.clerkInstance.loaded = false;
    mocks.clerkInstance.status = 'loading';
    mocks.getClientToken.mockResolvedValue('native-client-token');

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.clerkInstance.on).toHaveBeenCalledWith('status', expect.any(Function));
    });
    expect(mocks.configure).not.toHaveBeenCalled();
    expect(mocks.getClientToken).not.toHaveBeenCalled();
    expect(mocks.tokenCache.saveToken).not.toHaveBeenCalled();
    expect(mocks.clerkInstance.__internal_reloadInitialResources).not.toHaveBeenCalled();
    act(() => {
      mocks.clerkListener?.();
    });
    expect(mocks.syncClientStateFromJs).not.toHaveBeenCalled();

    await act(async () => {
      mocks.clerkInstance.loaded = true;
      mocks.clerkInstance.status = 'ready';
      mocks.clerkStatusListener?.('ready');
    });

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', null);
      expect(mocks.tokenCache.saveToken).toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY, 'native-client-token');
    });
    expect(mocks.clerkInstance.__internal_reloadInitialResources).toHaveBeenCalled();
    expect(mocks.clerkInstance.off).toHaveBeenCalledWith('status', expect.any(Function));
  });

  test('syncs a JS token rotated during bootstrap to native exactly once', async () => {
    const configure = deferred();
    mocks.configure.mockReturnValue(configure.promise);
    mocks.tokenCache.getToken.mockResolvedValueOnce('cached-client-token').mockResolvedValue('rotated-client-token');
    mocks.getClientToken.mockResolvedValue('native-client-token');

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', 'cached-client-token');
    });
    expect(mocks.configure).toHaveBeenCalledTimes(1);
    expect(mocks.syncClientStateFromJs).not.toHaveBeenCalled();

    act(() => {
      configure.resolve();
    });

    await waitFor(() => {
      expect(mocks.syncClientStateFromJs).toHaveBeenCalledWith(
        'rotated-client-token',
        'clerk-expo-js-sync-bootstrap',
        true,
        true,
      );
    });
    expect(mocks.syncClientStateFromJs).toHaveBeenCalledTimes(1);
    expect(mocks.clerkInstance.__internal_reloadInitialResources).not.toHaveBeenCalled();
  });

  test('flushes one JS client change that occurs after JS loads but before native is ready', async () => {
    const configure = deferred();
    mocks.configure.mockReturnValue(configure.promise);

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledTimes(1);
      expect(mocks.clerkInstance.addListener).toHaveBeenCalled();
    });

    act(() => {
      mocks.clerkListener?.();
    });
    expect(mocks.syncClientStateFromJs).not.toHaveBeenCalled();

    act(() => {
      configure.resolve();
    });

    await waitFor(() => {
      expect(mocks.syncClientStateFromJs).toHaveBeenCalledWith(null, expect.any(String), true, false);
    });
    expect(mocks.syncClientStateFromJs).toHaveBeenCalledTimes(1);
  });

  test('keeps synchronization enabled when native configure rejects', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.configure.mockRejectedValue(new Error('native refresh failed'));

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledTimes(1);
    });

    act(() => {
      mocks.clerkListener?.();
    });

    await waitFor(() => {
      expect(mocks.syncClientStateFromJs).toHaveBeenCalledWith(null, expect.any(String), true, false);
    });

    consoleError.mockRestore();
  });

  test('keeps native recovery authoritative when JS creates a client from an empty cache', async () => {
    mocks.tokenCache.getToken.mockResolvedValueOnce(null).mockResolvedValue('anonymous-js-token');
    mocks.getClientToken.mockResolvedValue('native-client-token');

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.tokenCache.saveToken).toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY, 'native-client-token');
    });
    expect(mocks.configure).toHaveBeenCalledTimes(1);
    expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', null);
    expect(mocks.syncClientStateFromJs).not.toHaveBeenCalled();
    expect(mocks.clerkInstance.__internal_reloadInitialResources).toHaveBeenCalledTimes(1);
  });

  test('does not notify native when the token cache writes the current token again', async () => {
    mocks.tokenCache.getToken.mockResolvedValue('client-token');
    mocks.getClientToken.mockResolvedValue('client-token');

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.clerkInstance.addListener).toHaveBeenCalled();
    });

    mocks.syncClientStateFromJs.mockClear();
    await act(async () => {
      await mocks.clerkOptions?.tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, 'client-token');
    });

    expect(mocks.syncClientStateFromJs).not.toHaveBeenCalled();
  });

  test('syncs JS token cache changes when ClerkProvider uses the default token cache', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);

    render(<ClerkProvider publishableKey='pk_test_123' />);

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', null);
    });

    mocks.syncClientStateFromJs.mockClear();

    await act(async () => {
      await mocks.clerkOptions?.tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, 'client-token');
    });

    await waitFor(() => {
      expect(mocks.syncClientStateFromJs).toHaveBeenCalledWith('client-token', expect.any(String), false, true);
    });
  });

  test('reloads JS resources after native emits a device token change', async () => {
    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });

    mocks.clerkInstance.__internal_reloadInitialResources.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      changed: {
        client: false,
        deviceToken: true,
      },
      deviceToken: 'native-client-token',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.tokenCache.saveToken).toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY, 'native-client-token');
    });
    expect(mocks.clerkInstance.__internal_reloadInitialResources).toHaveBeenCalled();
  });

  test('reloads JS resources after native clears the device token', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });

    mocks.clerkInstance.__internal_reloadInitialResources.mockClear();
    mocks.tokenCache.saveToken.mockClear();
    mocks.tokenCache.clearToken.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      changed: {
        client: false,
        deviceToken: true,
      },
      deviceToken: null,
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.clerkInstance.__internal_reloadInitialResources).toHaveBeenCalled();
    });
    expect(mocks.tokenCache.saveToken).not.toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY, expect.anything());
    expect(mocks.tokenCache.clearToken).toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY);
  });

  test('reloads JS resources after a native client-only change without rewriting the token cache', async () => {
    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });

    mocks.clerkInstance.__internal_reloadInitialResources.mockClear();
    mocks.tokenCache.saveToken.mockClear();
    mocks.tokenCache.clearToken.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      changed: {
        client: true,
        deviceToken: false,
      },
      deviceToken: 'native-client-token',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.clerkInstance.__internal_reloadInitialResources).toHaveBeenCalled();
    });
    expect(mocks.tokenCache.saveToken).not.toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY, expect.anything());
    expect(mocks.tokenCache.clearToken).not.toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY);
  });

  test('does not bounce a JS client listener event while applying a native client change', async () => {
    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });

    mocks.syncClientStateFromJs.mockClear();
    mocks.clerkInstance.__internal_reloadInitialResources.mockImplementation(() => {
      mocks.clerkListener?.();
    });

    mocks.nativeClientEvent = {
      issuedAt: 1,
      changed: {
        client: true,
        deviceToken: true,
      },
      deviceToken: 'native-client-token',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.clerkInstance.__internal_reloadInitialResources).toHaveBeenCalled();
    });
    expect(mocks.syncClientStateFromJs).not.toHaveBeenCalled();
  });

  test('keeps token cache notifications suppressed across overlapping native token writes', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);

    const firstSave = deferred();
    const secondSave = deferred();
    mocks.tokenCache.saveToken
      .mockImplementationOnce(() => firstSave.promise)
      .mockImplementationOnce(() => secondSave.promise);

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', null);
    });

    mocks.syncClientStateFromJs.mockClear();
    mocks.clerkInstance.__internal_reloadInitialResources.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      changed: {
        client: false,
        deviceToken: true,
      },
      deviceToken: 'native-client-token-1',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.tokenCache.saveToken).toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY, 'native-client-token-1');
    });

    mocks.nativeClientEvent = {
      issuedAt: 2,
      changed: {
        client: false,
        deviceToken: true,
      },
      deviceToken: 'native-client-token-2',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.tokenCache.saveToken).toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY, 'native-client-token-2');
    });

    await act(async () => {
      firstSave.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mocks.syncClientStateFromJs).not.toHaveBeenCalled();

    await act(async () => {
      secondSave.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mocks.clerkInstance.__internal_reloadInitialResources).toHaveBeenCalledTimes(2);
    });
    expect(mocks.syncClientStateFromJs).not.toHaveBeenCalled();
  });

  test('emits the refreshed JS client after a native client update keeps the active session', async () => {
    const activeSession = {
      id: 'session_1',
      status: 'active',
      user: { id: 'user_1', lastName: 'Before' },
    };
    const updatedActiveSession = {
      id: 'session_1',
      status: 'active',
      user: { id: 'user_1', lastName: 'After' },
    };
    const refreshedClient = {
      signedInSessions: [updatedActiveSession],
      lastActiveSessionId: 'session_1',
    };
    const originalUpdateClient = mocks.clerkInstance.updateClient;

    mocks.clerkInstance.client = {
      signedInSessions: [activeSession],
      lastActiveSessionId: 'session_1',
      fetch: vi.fn().mockResolvedValue(refreshedClient),
    };
    mocks.clerkInstance.session = activeSession;

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });

    mocks.nativeClientEvent = {
      issuedAt: 1,
      changed: {
        client: true,
        deviceToken: false,
      },
      deviceToken: 'native-client-token',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(originalUpdateClient).toHaveBeenCalledWith(refreshedClient);
    });
    expect(originalUpdateClient).not.toHaveBeenCalledWith(refreshedClient, {
      __internal_dangerouslySkipEmit: true,
    });
    expect(mocks.clerkInstance.__internal_reloadInitialResources).not.toHaveBeenCalled();
    expect(mocks.clerkInstance.setActive).not.toHaveBeenCalled();
  });

  test('sets the refreshed native last active session without emitting a stale signed-out JS state', async () => {
    const removedSession = {
      id: 'session_1',
      status: 'active',
      user: { id: 'user_1' },
    };
    const remainingSession = {
      id: 'session_2',
      status: 'active',
      user: { id: 'user_2' },
    };
    const originalUpdateClient = mocks.clerkInstance.updateClient;

    mocks.clerkInstance.client = {
      signedInSessions: [removedSession],
      lastActiveSessionId: 'session_1',
      fetch: vi.fn().mockResolvedValue({
        signedInSessions: [remainingSession],
        lastActiveSessionId: 'session_2',
      }),
    };
    mocks.clerkInstance.session = removedSession;
    mocks.clerkInstance.setActive.mockImplementation(({ session }) => {
      mocks.clerkInstance.session = session;
      return Promise.resolve();
    });

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });

    mocks.clerkInstance.setActive.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      changed: {
        client: true,
        deviceToken: true,
      },
      deviceToken: 'native-client-token',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.clerkInstance.setActive).toHaveBeenCalledWith({ session: remainingSession });
    });
    expect(originalUpdateClient).toHaveBeenCalledWith(
      {
        signedInSessions: [remainingSession],
        lastActiveSessionId: 'session_2',
      },
      { __internal_dangerouslySkipEmit: true },
    );
    expect(mocks.clerkInstance.__internal_reloadInitialResources).not.toHaveBeenCalled();
  });

  test('does not explicitly sign JS out when a native client change leaves no signed-in sessions', async () => {
    const removedSession = {
      id: 'session_1',
      status: 'active',
      user: { id: 'user_1' },
    };
    const originalUpdateClient = mocks.clerkInstance.updateClient;

    mocks.clerkInstance.client = {
      signedInSessions: [removedSession],
      lastActiveSessionId: 'session_1',
      fetch: vi.fn().mockResolvedValue({
        signedInSessions: [],
        lastActiveSessionId: null,
      }),
    };
    mocks.clerkInstance.session = removedSession;

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });

    mocks.clerkInstance.setActive.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      changed: {
        client: true,
        deviceToken: true,
      },
      deviceToken: null,
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(originalUpdateClient).toHaveBeenCalledWith({
        signedInSessions: [],
        lastActiveSessionId: null,
      });
    });
    expect(originalUpdateClient).not.toHaveBeenCalledWith(
      {
        signedInSessions: [],
        lastActiveSessionId: null,
      },
      { __internal_dangerouslySkipEmit: true },
    );
    expect(mocks.clerkInstance.__internal_reloadInitialResources).not.toHaveBeenCalled();
    expect(mocks.clerkInstance.setActive).not.toHaveBeenCalled();
  });

  test('keeps the remaining JS session when the old active session becomes unauthenticated', async () => {
    const removedSession = {
      id: 'session_1',
      status: 'active',
      user: { id: 'user_1' },
    };
    const remainingSession = {
      id: 'session_2',
      status: 'active',
      user: { id: 'user_2' },
    };
    const originalHandleUnauthenticated = mocks.clerkInstance.handleUnauthenticated;
    const originalUpdateClient = mocks.clerkInstance.updateClient;

    mocks.clerkInstance.client = {
      signedInSessions: [removedSession],
      lastActiveSessionId: 'session_1',
      fetch: vi.fn().mockResolvedValue({
        signedInSessions: [remainingSession],
        lastActiveSessionId: 'session_2',
      }),
    };
    mocks.clerkInstance.session = removedSession;
    mocks.clerkInstance.setActive.mockImplementation(({ session }) => {
      mocks.clerkInstance.session = session;
      return Promise.resolve();
    });

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mocks.clerkInstance.handleUnauthenticated).not.toBe(originalHandleUnauthenticated);
    });

    await act(async () => {
      await mocks.clerkInstance.handleUnauthenticated();
    });

    expect(originalHandleUnauthenticated).not.toHaveBeenCalled();
    expect(originalUpdateClient).toHaveBeenCalledWith(
      {
        signedInSessions: [remainingSession],
        lastActiveSessionId: 'session_2',
      },
      { __internal_dangerouslySkipEmit: true },
    );
    expect(mocks.clerkInstance.setActive).toHaveBeenCalledWith({ session: remainingSession });
  });

  test('treats client payloads that remove the active session as a session switch when another session remains', async () => {
    const removedSession = {
      id: 'session_1',
      status: 'active',
      user: { id: 'user_1' },
    };
    const remainingSession = {
      id: 'session_2',
      status: 'active',
      user: { id: 'user_2' },
    };
    const originalUpdateClient = mocks.clerkInstance.updateClient;

    mocks.clerkInstance.client = {
      signedInSessions: [removedSession],
      lastActiveSessionId: 'session_1',
    };
    mocks.clerkInstance.session = removedSession;
    mocks.clerkInstance.setActive.mockImplementation(({ session }) => {
      mocks.clerkInstance.session = session;
      return Promise.resolve();
    });

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mocks.clerkInstance.updateClient).not.toBe(originalUpdateClient);
    });

    originalUpdateClient.mockClear();

    act(() => {
      mocks.clerkInstance.updateClient({
        signedInSessions: [remainingSession],
        lastActiveSessionId: 'session_2',
      });
    });

    await waitFor(() => {
      expect(mocks.clerkInstance.setActive).toHaveBeenCalledWith({ session: remainingSession });
    });
    expect(originalUpdateClient).toHaveBeenCalledWith(
      {
        signedInSessions: [remainingSession],
        lastActiveSessionId: 'session_2',
      },
      { __internal_dangerouslySkipEmit: true },
    );
    expect(originalUpdateClient).not.toHaveBeenCalledWith({
      signedInSessions: [remainingSession],
      lastActiveSessionId: 'session_2',
    });
  });

  test('keeps follow-up client updates suppressed while reconciling a removed active session', async () => {
    const removedSession = {
      id: 'session_1',
      status: 'active',
      user: { id: 'user_1' },
    };
    const remainingSession = {
      id: 'session_2',
      status: 'active',
      user: { id: 'user_2' },
    };
    const originalUpdateClient = mocks.clerkInstance.updateClient;
    let resolveSetActive: (() => void) | undefined;

    mocks.clerkInstance.client = {
      signedInSessions: [removedSession, remainingSession],
      lastActiveSessionId: 'session_1',
    };
    mocks.clerkInstance.session = removedSession;
    mocks.clerkInstance.setActive.mockImplementation(({ session }) => {
      return new Promise<void>(resolve => {
        resolveSetActive = () => {
          mocks.clerkInstance.session = session;
          resolve();
        };
      });
    });

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mocks.clerkInstance.updateClient).not.toBe(originalUpdateClient);
    });

    originalUpdateClient.mockClear();

    act(() => {
      mocks.clerkInstance.updateClient(
        {
          signedInSessions: [remainingSession],
          lastActiveSessionId: 'session_2',
        },
        { __internal_dangerouslySkipEmit: true },
      );
      mocks.clerkInstance.updateClient({
        signedInSessions: [remainingSession],
        lastActiveSessionId: 'session_2',
      });
    });

    expect(originalUpdateClient).toHaveBeenNthCalledWith(
      1,
      {
        signedInSessions: [remainingSession],
        lastActiveSessionId: 'session_2',
      },
      { __internal_dangerouslySkipEmit: true },
    );
    expect(originalUpdateClient).toHaveBeenNthCalledWith(
      2,
      {
        signedInSessions: [remainingSession],
        lastActiveSessionId: 'session_2',
      },
      { __internal_dangerouslySkipEmit: true },
    );
    expect(originalUpdateClient).not.toHaveBeenCalledWith({
      signedInSessions: [remainingSession],
      lastActiveSessionId: 'session_2',
    });

    await act(async () => {
      resolveSetActive?.();
    });

    expect(mocks.clerkInstance.setActive).toHaveBeenCalledTimes(1);
    expect(mocks.clerkInstance.setActive).toHaveBeenCalledWith({ session: remainingSession });
  });

  test('does not fall back to JS sign-out when stale unauthenticated recovery still has a native device token', async () => {
    const removedSession = {
      id: 'session_1',
      status: 'active',
      user: { id: 'user_1' },
    };
    const originalHandleUnauthenticated = mocks.clerkInstance.handleUnauthenticated;

    mocks.clerkInstance.client = {
      signedInSessions: [removedSession],
      lastActiveSessionId: 'session_1',
      fetch: vi.fn().mockImplementation(async () => {
        await mocks.clerkInstance.handleUnauthenticated();
        throw new Error('stale session 401');
      }),
    };
    mocks.clerkInstance.session = removedSession;
    mocks.getClientToken.mockResolvedValue('native-client-token');

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mocks.clerkInstance.handleUnauthenticated).not.toBe(originalHandleUnauthenticated);
    });

    await act(async () => {
      await mocks.clerkInstance.handleUnauthenticated();
    });

    expect(mocks.tokenCache.saveToken).toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY, 'native-client-token');
    expect(originalHandleUnauthenticated).not.toHaveBeenCalled();
    expect(mocks.clerkInstance.setActive).not.toHaveBeenCalledWith({ session: null });
  });

  test('falls back to JS unauthenticated handling when native token recovery has no signed-in sessions', async () => {
    const removedSession = {
      id: 'session_1',
      status: 'active',
      user: { id: 'user_1' },
    };
    const originalHandleUnauthenticated = mocks.clerkInstance.handleUnauthenticated;

    mocks.clerkInstance.client = {
      signedInSessions: [removedSession],
      lastActiveSessionId: 'session_1',
      fetch: vi.fn().mockRejectedValue(new Error('stale session 401')),
    };
    mocks.clerkInstance.session = removedSession;
    mocks.getClientToken.mockResolvedValue('native-client-token');
    mocks.clerkInstance.__internal_reloadInitialResources.mockImplementation(() => {
      mocks.clerkInstance.client = {
        signedInSessions: [],
        lastActiveSessionId: null,
      };
      mocks.clerkInstance.session = null;
    });

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mocks.clerkInstance.handleUnauthenticated).not.toBe(originalHandleUnauthenticated);
    });

    await act(async () => {
      await mocks.clerkInstance.handleUnauthenticated();
    });

    expect(mocks.tokenCache.saveToken).toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY, 'native-client-token');
    expect(originalHandleUnauthenticated).toHaveBeenCalled();
  });

  test('refreshes native from the server after the JS client changes', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', null);
    });

    mocks.syncClientStateFromJs.mockClear();
    mocks.tokenCache.getToken.mockResolvedValue('client-token');
    act(() => {
      mocks.clerkListener?.();
    });

    await waitFor(() => {
      expect(mocks.syncClientStateFromJs).toHaveBeenCalledWith(null, expect.any(String), true, false);
    });
  });

  test('continues processing queued native sync after a native sync failure', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);
    let rejectFirstSync: ((error: Error) => void) | undefined;
    mocks.syncClientStateFromJs.mockImplementationOnce(() => {
      return new Promise((_resolve, reject) => {
        rejectFirstSync = reject;
      });
    });

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', null);
    });

    act(() => {
      mocks.clerkListener?.();
    });

    await waitFor(() => {
      expect(mocks.syncClientStateFromJs).toHaveBeenCalledWith(null, expect.any(String), true, false);
    });

    await act(async () => {
      await mocks.clerkOptions?.tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, 'client-token');
      rejectFirstSync?.(new Error('native sync failed'));
    });

    await waitFor(() => {
      expect(mocks.syncClientStateFromJs).toHaveBeenCalledWith('client-token', expect.any(String), false, true);
    });
  });

  test('keeps a pending native client refresh while a token sync is in flight', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);
    let resolveFirstSync: (() => void) | undefined;
    mocks.syncClientStateFromJs.mockImplementationOnce(() => {
      return new Promise<void>(resolve => {
        resolveFirstSync = resolve;
      });
    });

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', null);
    });

    await act(async () => {
      await mocks.clerkOptions?.tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, 'client-token');
    });

    await waitFor(() => {
      expect(mocks.syncClientStateFromJs).toHaveBeenCalledWith('client-token', expect.any(String), false, true);
    });

    act(() => {
      mocks.clerkListener?.();
    });

    await act(async () => {
      resolveFirstSync?.();
    });

    await waitFor(() => {
      expect(mocks.syncClientStateFromJs).toHaveBeenCalledWith(null, expect.any(String), true, false);
    });
  });

  test('refreshes native with the saved token after the JS token cache changes', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', null);
    });

    mocks.syncClientStateFromJs.mockClear();

    await act(async () => {
      await mocks.clerkOptions?.tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, 'client-token');
    });

    await waitFor(() => {
      expect(mocks.syncClientStateFromJs).toHaveBeenCalledWith('client-token', expect.any(String), false, true);
    });
  });

  test('ignores native client events that echo a JS-originated sync', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', null);
    });

    mocks.syncClientStateFromJs.mockClear();

    await act(async () => {
      await mocks.clerkOptions?.tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, 'client-token');
    });

    await waitFor(() => {
      expect(mocks.syncClientStateFromJs).toHaveBeenCalledWith('client-token', expect.any(String), false, true);
    });

    const sourceId = mocks.syncClientStateFromJs.mock.calls[0]?.[1];
    mocks.clerkInstance.__internal_reloadInitialResources.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      changed: {
        client: false,
        deviceToken: true,
      },
      deviceToken: 'client-token',
      sourceId,
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await act(async () => {});

    expect(mocks.clerkInstance.__internal_reloadInitialResources).not.toHaveBeenCalled();
  });

  test('refreshes native from the server after the JS token cache is cleared', async () => {
    mocks.tokenCache.getToken.mockResolvedValue('client-token');
    mocks.getClientToken.mockResolvedValue('client-token');

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.clerkInstance.addListener).toHaveBeenCalled();
    });

    mocks.syncClientStateFromJs.mockClear();

    await act(async () => {
      await mocks.clerkOptions?.tokenCache?.clearToken?.(CLERK_CLIENT_JWT_KEY);
    });

    await waitFor(() => {
      expect(mocks.syncClientStateFromJs).toHaveBeenCalledWith(null, expect.any(String), false, true);
    });
  });

  test('rejects a foreign session-less native client token while JS is signed in and heals native', async () => {
    const activeSession = {
      id: 'session_1',
      status: 'active',
      user: { id: 'user_1' },
    };
    const ghostClient = {
      id: 'client_ghost',
      signedInSessions: [],
      lastActiveSessionId: null,
    };
    const originalUpdateClient = mocks.clerkInstance.updateClient;

    mocks.tokenCache.getToken.mockResolvedValue('js-client-token');
    mocks.getClientToken.mockResolvedValue('js-client-token');
    mocks.clerkInstance.client = {
      id: 'client_js',
      signedInSessions: [activeSession],
      lastActiveSessionId: 'session_1',
      fetch: vi.fn().mockResolvedValue(ghostClient),
    };
    mocks.clerkInstance.session = activeSession;

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });

    mocks.tokenCache.saveToken.mockClear();
    mocks.syncClientStateFromJs.mockClear();
    mocks.clerkInstance.__internal_reloadInitialResources.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      changed: {
        client: true,
        deviceToken: true,
      },
      deviceToken: 'ghost-client-token',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.tokenCache.saveToken).toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY, 'js-client-token');
    });
    expect(mocks.tokenCache.saveToken).toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY, 'ghost-client-token');
    expect(originalUpdateClient).not.toHaveBeenCalledWith(ghostClient);
    expect(originalUpdateClient).not.toHaveBeenCalledWith(ghostClient, expect.anything());
    expect(mocks.clerkInstance.session).toBe(activeSession);
    expect(mocks.clerkInstance.__internal_reloadInitialResources).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(mocks.syncClientStateFromJs).toHaveBeenCalledWith('js-client-token', expect.any(String), false, true);
    });
  });

  test('still signs JS out when the same client loses its signed-in sessions', async () => {
    const activeSession = {
      id: 'session_1',
      status: 'active',
      user: { id: 'user_1' },
    };
    const signedOutClient = {
      id: 'client_shared',
      signedInSessions: [],
      lastActiveSessionId: null,
    };
    const originalUpdateClient = mocks.clerkInstance.updateClient;

    mocks.tokenCache.getToken.mockResolvedValue('js-client-token');
    mocks.getClientToken.mockResolvedValue('js-client-token');
    mocks.clerkInstance.client = {
      id: 'client_shared',
      signedInSessions: [activeSession],
      lastActiveSessionId: 'session_1',
      fetch: vi.fn().mockResolvedValue(signedOutClient),
    };
    mocks.clerkInstance.session = activeSession;

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });

    mocks.syncClientStateFromJs.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      changed: {
        client: true,
        deviceToken: false,
      },
      deviceToken: 'js-client-token',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(originalUpdateClient).toHaveBeenCalledWith(signedOutClient);
    });
    expect(mocks.syncClientStateFromJs).not.toHaveBeenCalled();
  });

  test('adopts a different native client that has signed-in sessions', async () => {
    const activeSession = {
      id: 'session_1',
      status: 'active',
      user: { id: 'user_1' },
    };
    const nativeSession = {
      id: 'session_2',
      status: 'active',
      user: { id: 'user_2' },
    };
    const nativeClient = {
      id: 'client_native',
      signedInSessions: [nativeSession],
      lastActiveSessionId: 'session_2',
    };
    const originalUpdateClient = mocks.clerkInstance.updateClient;

    mocks.tokenCache.getToken.mockResolvedValue('js-client-token');
    mocks.getClientToken.mockResolvedValue('js-client-token');
    mocks.clerkInstance.client = {
      id: 'client_js',
      signedInSessions: [activeSession],
      lastActiveSessionId: 'session_1',
      fetch: vi.fn().mockResolvedValue(nativeClient),
    };
    mocks.clerkInstance.session = activeSession;
    mocks.clerkInstance.setActive.mockImplementation(({ session }) => {
      mocks.clerkInstance.session = session;
      return Promise.resolve();
    });

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });

    mocks.tokenCache.saveToken.mockClear();
    mocks.clerkInstance.setActive.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      changed: {
        client: true,
        deviceToken: true,
      },
      deviceToken: 'native-client-token',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.clerkInstance.setActive).toHaveBeenCalledWith({ session: nativeSession });
    });
    expect(originalUpdateClient).toHaveBeenCalledWith(nativeClient, { __internal_dangerouslySkipEmit: true });
    expect(mocks.tokenCache.saveToken).toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY, 'native-client-token');
    expect(mocks.tokenCache.saveToken).not.toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY, 'js-client-token');
  });

  test('ignores divergent native events while a JS-to-native device token push is in flight', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);
    let resolveFirstSync: (() => void) | undefined;
    mocks.syncClientStateFromJs.mockImplementationOnce(() => {
      return new Promise<void>(resolve => {
        resolveFirstSync = resolve;
      });
    });

    const fetchSpy = vi.fn().mockResolvedValue({
      id: 'client_ghost',
      signedInSessions: [],
      lastActiveSessionId: null,
    });
    mocks.clerkInstance.client = {
      id: 'client_js',
      signedInSessions: [],
      lastActiveSessionId: null,
      fetch: fetchSpy,
    };

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', null);
    });

    await act(async () => {
      await mocks.clerkOptions?.tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, 'rotated-client-token');
    });

    await waitFor(() => {
      expect(mocks.syncClientStateFromJs).toHaveBeenCalledWith('rotated-client-token', expect.any(String), false, true);
    });

    mocks.tokenCache.saveToken.mockClear();
    mocks.clerkInstance.__internal_reloadInitialResources.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      changed: {
        client: true,
        deviceToken: true,
      },
      deviceToken: 'ghost-client-token',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await act(async () => {});

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(mocks.tokenCache.saveToken).not.toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY, 'ghost-client-token');
    expect(mocks.clerkInstance.__internal_reloadInitialResources).not.toHaveBeenCalled();

    await act(async () => {
      resolveFirstSync?.();
    });

    mocks.nativeClientEvent = {
      issuedAt: 2,
      changed: {
        client: true,
        deviceToken: true,
      },
      deviceToken: 'ghost-client-token',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  test('processes native events again after a failed JS-to-native push settles', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);
    let rejectFirstSync: ((error: Error) => void) | undefined;
    mocks.syncClientStateFromJs.mockImplementationOnce(() => {
      return new Promise((_resolve, reject) => {
        rejectFirstSync = reject;
      });
    });

    const fetchSpy = vi.fn().mockResolvedValue({
      id: 'client_ghost',
      signedInSessions: [],
      lastActiveSessionId: null,
    });
    mocks.clerkInstance.client = {
      id: 'client_js',
      signedInSessions: [],
      lastActiveSessionId: null,
      fetch: fetchSpy,
    };

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', null);
    });

    await act(async () => {
      await mocks.clerkOptions?.tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, 'rotated-client-token');
    });

    await waitFor(() => {
      expect(mocks.syncClientStateFromJs).toHaveBeenCalledWith('rotated-client-token', expect.any(String), false, true);
    });

    mocks.nativeClientEvent = {
      issuedAt: 1,
      changed: {
        client: true,
        deviceToken: true,
      },
      deviceToken: 'ghost-client-token',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await act(async () => {});
    expect(fetchSpy).not.toHaveBeenCalled();

    await act(async () => {
      rejectFirstSync?.(new Error('native sync failed'));
    });

    mocks.nativeClientEvent = {
      issuedAt: 2,
      changed: {
        client: true,
        deviceToken: true,
      },
      deviceToken: 'ghost-client-token',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  test('adopts a foreign session-less client while JS is signed out', async () => {
    const ghostClient = {
      id: 'client_ghost',
      signedInSessions: [],
      lastActiveSessionId: null,
    };
    const originalUpdateClient = mocks.clerkInstance.updateClient;

    mocks.tokenCache.getToken.mockResolvedValue('js-client-token');
    mocks.getClientToken.mockResolvedValue('js-client-token');
    mocks.clerkInstance.client = {
      id: 'client_js',
      signedInSessions: [],
      lastActiveSessionId: null,
      fetch: vi.fn().mockResolvedValue(ghostClient),
    };
    mocks.clerkInstance.session = undefined;

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });

    mocks.syncClientStateFromJs.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      changed: {
        client: true,
        deviceToken: true,
      },
      deviceToken: 'ghost-client-token',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(originalUpdateClient).toHaveBeenCalledWith(ghostClient);
    });
    expect(mocks.syncClientStateFromJs).not.toHaveBeenCalled();
  });
});
