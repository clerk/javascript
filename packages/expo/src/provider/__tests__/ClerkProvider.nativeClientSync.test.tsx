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
    syncFromJsClientToken: vi.fn(),
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
      client: undefined as unknown,
      handleUnauthenticated: vi.fn(),
      loaded: true,
      session: undefined as unknown,
      setActive: vi.fn(),
      updateClient: vi.fn(),
    },
    clerkListener: undefined as (() => void) | undefined,
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
      configure: mocks.configure,
      getClientToken: mocks.getClientToken,
      syncFromJsClientToken: mocks.syncFromJsClientToken,
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

describe('ClerkProvider native client sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.nativeClientEvent = null;
    mocks.configure.mockResolvedValue(undefined);
    mocks.getClientToken.mockResolvedValue('native-client-token');
    mocks.syncFromJsClientToken.mockResolvedValue(undefined);
    mocks.tokenCache.getToken.mockResolvedValue('client-token');
    mocks.tokenCache.saveToken.mockResolvedValue(undefined);
    mocks.tokenCache.clearToken.mockResolvedValue(undefined);
    mocks.clerkOptions = undefined;
    mocks.clerkInstance.__internal_reloadInitialResources.mockResolvedValue(undefined);
    mocks.clerkInstance.client = undefined;
    mocks.clerkInstance.handleUnauthenticated = vi.fn().mockResolvedValue(undefined);
    mocks.clerkInstance.session = undefined;
    mocks.clerkInstance.setActive.mockResolvedValue(undefined);
    mocks.clerkInstance.updateClient = vi.fn();
    mocks.clerkInstance.updateClient.mockImplementation(client => {
      mocks.clerkInstance.client = client;
      const currentSession = mocks.clerkInstance.session as { id?: string } | null | undefined;
      mocks.clerkInstance.session = currentSession
        ? client.signedInSessions.find((session: { id: string }) => session.id === currentSession.id) || null
        : currentSession;
    });
    mocks.clerkListener = undefined;
    mocks.clerkInstance.addListener.mockImplementation(listener => {
      mocks.clerkListener = listener;
      return vi.fn();
    });
  });

  test('configures native with the cached JS client token during bootstrap', async () => {
    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', 'client-token');
    });
  });

  test('syncs JS token cache changes when ClerkProvider uses the default token cache', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);

    render(<ClerkProvider publishableKey='pk_test_123' />);

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', null);
    });

    mocks.syncFromJsClientToken.mockClear();

    await act(async () => {
      await mocks.clerkOptions?.tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, 'client-token');
    });

    await waitFor(() => {
      expect(mocks.syncFromJsClientToken).toHaveBeenCalledWith('client-token', expect.any(String));
    });
  });

  test('reloads JS resources after native emits a client change with a token', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);
    mocks.getClientToken.mockResolvedValue(null);

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
    mocks.getClientToken.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      clientToken: 'native-client-token',
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
    expect(mocks.getClientToken).not.toHaveBeenCalled();
  });

  test('reloads JS resources after native emits a client change without a token', async () => {
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
      clientToken: null,
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

    mocks.syncFromJsClientToken.mockClear();
    mocks.clerkInstance.__internal_reloadInitialResources.mockImplementation(() => {
      mocks.clerkListener?.();
    });

    mocks.nativeClientEvent = {
      issuedAt: 1,
      clientToken: 'native-client-token',
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
    expect(mocks.syncFromJsClientToken).not.toHaveBeenCalled();
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
    mocks.getClientToken.mockResolvedValue(null);

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
      clientToken: 'native-client-token',
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
    mocks.getClientToken.mockResolvedValue(null);

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
      clientToken: null,
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(originalUpdateClient).toHaveBeenCalledWith(
        {
          signedInSessions: [],
          lastActiveSessionId: null,
        },
        { __internal_dangerouslySkipEmit: false },
      );
    });
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
    mocks.getClientToken.mockResolvedValue(null);

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

  test('does not fall back to JS sign-out when stale unauthenticated recovery still has a native client token', async () => {
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

    mocks.syncFromJsClientToken.mockClear();
    mocks.tokenCache.getToken.mockResolvedValue('client-token');
    act(() => {
      mocks.clerkListener?.();
    });

    await waitFor(() => {
      expect(mocks.syncFromJsClientToken).toHaveBeenCalledWith(null, expect.any(String));
    });
  });

  test('continues processing queued native sync after a native sync failure', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);
    let rejectFirstSync: ((error: Error) => void) | undefined;
    mocks.syncFromJsClientToken.mockImplementationOnce(() => {
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
      expect(mocks.syncFromJsClientToken).toHaveBeenCalledWith(null, expect.any(String));
    });

    await act(async () => {
      await mocks.clerkOptions?.tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, 'client-token');
      rejectFirstSync?.(new Error('native sync failed'));
    });

    await waitFor(() => {
      expect(mocks.syncFromJsClientToken).toHaveBeenCalledWith('client-token', expect.any(String));
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

    mocks.syncFromJsClientToken.mockClear();

    await act(async () => {
      await mocks.clerkOptions?.tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, 'client-token');
    });

    await waitFor(() => {
      expect(mocks.syncFromJsClientToken).toHaveBeenCalledWith('client-token', expect.any(String));
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

    mocks.syncFromJsClientToken.mockClear();

    await act(async () => {
      await mocks.clerkOptions?.tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, 'client-token');
    });

    await waitFor(() => {
      expect(mocks.syncFromJsClientToken).toHaveBeenCalledWith('client-token', expect.any(String));
    });

    const sourceId = mocks.syncFromJsClientToken.mock.calls[0]?.[1];
    mocks.clerkInstance.__internal_reloadInitialResources.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      clientToken: 'client-token',
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
    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalled();
    });

    mocks.syncFromJsClientToken.mockClear();

    await act(async () => {
      await mocks.clerkOptions?.tokenCache?.clearToken?.(CLERK_CLIENT_JWT_KEY);
    });

    await waitFor(() => {
      expect(mocks.syncFromJsClientToken).toHaveBeenCalledWith(null, expect.any(String));
    });
  });
});
