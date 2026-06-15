import { render, waitFor } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { CLERK_CLIENT_JWT_KEY } from '../../constants';
import { ClerkProvider } from '../ClerkProvider';

const mocks = vi.hoisted(() => {
  return {
    configure: vi.fn(),
    getSession: vi.fn(),
    getClientToken: vi.fn(),
    nativeClientEvent: null as unknown,
    notifyNativeSessionChanged: vi.fn(),
    refreshClient: vi.fn(),
    signOut: vi.fn(),
    tokenCache: {
      clearToken: vi.fn(),
      getToken: vi.fn(),
      saveToken: vi.fn(),
    },
    clerkInstance: {
      __internal_reloadInitialResources: vi.fn(),
      addListener: vi.fn(),
      client: {
        lastActiveSessionId: 'sess_native',
      },
      loaded: true,
      session: {
        id: null,
      },
      setActive: vi.fn(),
    },
    authState: {
      isLoaded: true,
      sessionId: null as string | null,
    },
  };
});

vi.mock('../../polyfills', () => ({}));

vi.mock('@clerk/react', () => {
  return {
    useAuth: () => mocks.authState,
  };
});

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

vi.mock('../../hooks/nativeSessionEvents', () => {
  return {
    notifyNativeSessionChanged: mocks.notifyNativeSessionChanged,
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
      getSession: mocks.getSession,
      getClientToken: mocks.getClientToken,
      refreshClient: mocks.refreshClient,
      signOut: mocks.signOut,
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
    getClerkInstance: () => mocks.clerkInstance,
  };
});

describe('ClerkProvider native session notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.nativeClientEvent = null;
    mocks.configure.mockResolvedValue(undefined);
    mocks.getSession.mockResolvedValue({ sessionId: 'sess_native' });
    mocks.getClientToken.mockResolvedValue('native-client-token');
    mocks.signOut.mockResolvedValue(undefined);
    mocks.tokenCache.getToken.mockResolvedValue('client-token');
    mocks.tokenCache.saveToken.mockResolvedValue(undefined);
    mocks.tokenCache.clearToken.mockResolvedValue(undefined);
    mocks.clerkInstance.addListener.mockReturnValue(vi.fn());
    mocks.clerkInstance.client.lastActiveSessionId = 'sess_native';
    mocks.clerkInstance.session.id = null;
    mocks.authState.isLoaded = true;
    mocks.authState.sessionId = null;
  });

  test('refreshes useNativeSession subscribers after initial native configure', async () => {
    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', 'client-token');
    });

    await waitFor(() => {
      expect(mocks.notifyNativeSessionChanged).toHaveBeenCalled();
    });
  });

  test('activates the JS session after native signs in', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);
    mocks.getClientToken.mockResolvedValue(null);
    mocks.clerkInstance.client.lastActiveSessionId = null;

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.notifyNativeSessionChanged).toHaveBeenCalled();
    });
    expect(mocks.clerkInstance.setActive).not.toHaveBeenCalled();

    mocks.getClientToken.mockResolvedValue('native-client-token');
    mocks.clerkInstance.client.lastActiveSessionId = 'sess_native';
    mocks.clerkInstance.__internal_reloadInitialResources.mockClear();
    mocks.clerkInstance.setActive.mockClear();
    mocks.getClientToken.mockClear();
    mocks.getSession.mockClear();
    mocks.notifyNativeSessionChanged.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      sessionId: 'sess_native',
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
    expect(mocks.getClientToken).not.toHaveBeenCalled();
    expect(mocks.getSession).not.toHaveBeenCalled();
    expect(mocks.clerkInstance.__internal_reloadInitialResources).toHaveBeenCalled();
    expect(mocks.clerkInstance.setActive).toHaveBeenCalledWith({ session: 'sess_native' });
    expect(mocks.notifyNativeSessionChanged).not.toHaveBeenCalled();
  });

  test('clears the JS active session after native signs out', async () => {
    mocks.clerkInstance.client.lastActiveSessionId = 'sess_js';
    mocks.clerkInstance.session.id = 'sess_js';
    mocks.authState.sessionId = 'sess_js';

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.notifyNativeSessionChanged).toHaveBeenCalled();
    });
    expect(mocks.clerkInstance.setActive).not.toHaveBeenCalled();

    mocks.getClientToken.mockResolvedValue(null);
    mocks.getSession.mockResolvedValue(null);
    mocks.getClientToken.mockClear();
    mocks.getSession.mockClear();
    mocks.clerkInstance.client.lastActiveSessionId = null;
    mocks.clerkInstance.__internal_reloadInitialResources.mockClear();
    mocks.clerkInstance.setActive.mockClear();
    mocks.notifyNativeSessionChanged.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      sessionId: null,
      clientToken: null,
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.tokenCache.clearToken).toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY);
    });
    expect(mocks.getClientToken).not.toHaveBeenCalled();
    expect(mocks.getSession).not.toHaveBeenCalled();
    expect(mocks.clerkInstance.__internal_reloadInitialResources).toHaveBeenCalled();
    expect(mocks.clerkInstance.setActive).toHaveBeenCalledWith({ session: null });
    expect(mocks.notifyNativeSessionChanged).not.toHaveBeenCalled();
  });

  test('clears the JS active session before waiting for initial resources after native sign-out', async () => {
    mocks.clerkInstance.client.lastActiveSessionId = 'sess_js';
    mocks.clerkInstance.session.id = 'sess_js';
    mocks.authState.sessionId = 'sess_js';

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.notifyNativeSessionChanged).toHaveBeenCalled();
    });

    mocks.getClientToken.mockResolvedValue('native-client-token');
    mocks.getSession.mockResolvedValue(null);
    mocks.getClientToken.mockClear();
    mocks.getSession.mockClear();
    mocks.clerkInstance.__internal_reloadInitialResources.mockImplementation(() => new Promise(() => {}));
    mocks.clerkInstance.setActive.mockClear();
    mocks.notifyNativeSessionChanged.mockClear();

    mocks.nativeClientEvent = {
      issuedAt: 1,
      sessionId: null,
      clientToken: 'native-client-token',
    };
    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.clerkInstance.setActive).toHaveBeenCalledWith({ session: null });
    });
    expect(mocks.getSession).not.toHaveBeenCalled();
  });

  test('does not refresh native from JS when neither side has a client token', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);
    mocks.getClientToken.mockResolvedValue(null);
    mocks.clerkInstance.client.lastActiveSessionId = null;

    render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', null);
    });
    await waitFor(() => {
      expect(mocks.tokenCache.getToken).toHaveBeenCalled();
    });

    expect(mocks.refreshClient).not.toHaveBeenCalled();
  });

  test('pushes the cached JS client token to native after JS sign-in', async () => {
    mocks.tokenCache.getToken.mockResolvedValue(null);
    mocks.getClientToken.mockResolvedValue(null);
    mocks.clerkInstance.client.lastActiveSessionId = null;

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', null);
    });

    mocks.configure.mockClear();
    mocks.tokenCache.getToken.mockResolvedValue('client-token');
    mocks.authState.sessionId = 'sess_js';

    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', 'client-token');
    });
  });

  test('refreshes native after JS signs out', async () => {
    mocks.authState.sessionId = 'sess_js';

    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.configure).toHaveBeenCalledWith('pk_test_123', 'client-token');
    });

    mocks.configure.mockClear();
    mocks.notifyNativeSessionChanged.mockClear();
    mocks.refreshClient.mockClear();
    mocks.signOut.mockClear();
    mocks.tokenCache.getToken.mockResolvedValue(null);
    mocks.authState.sessionId = null;

    rerender(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.signOut).toHaveBeenCalledWith('sess_js');
    });
    expect(mocks.configure).not.toHaveBeenCalled();
    expect(mocks.refreshClient).not.toHaveBeenCalled();
    expect(mocks.notifyNativeSessionChanged).not.toHaveBeenCalled();
  });
});
