import { render, waitFor } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { CLERK_CLIENT_JWT_KEY } from '../../constants';
import { ClerkProvider } from '../ClerkProvider';

const mocks = vi.hoisted(() => {
  return {
    configure: vi.fn(),
    getClientToken: vi.fn(),
    nativeClientEvent: null as unknown,
    notifyNativeSessionChanged: vi.fn(),
    refreshClient: vi.fn(),
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
      getClientToken: mocks.getClientToken,
      refreshClient: mocks.refreshClient,
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
    mocks.getClientToken.mockResolvedValue('native-client-token');
    mocks.tokenCache.getToken.mockResolvedValue('client-token');
    mocks.tokenCache.saveToken.mockResolvedValue(undefined);
    mocks.tokenCache.clearToken.mockResolvedValue(undefined);
    mocks.clerkInstance.addListener.mockReturnValue(vi.fn());
    mocks.clerkInstance.client.lastActiveSessionId = 'sess_native';
    mocks.clerkInstance.session.id = null;
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

  test('refreshes useNativeSession subscribers after native client events sync back to JS', async () => {
    const { rerender } = render(
      <ClerkProvider
        publishableKey='pk_test_123'
        tokenCache={mocks.tokenCache}
      />,
    );

    await waitFor(() => {
      expect(mocks.notifyNativeSessionChanged).toHaveBeenCalled();
    });
    mocks.notifyNativeSessionChanged.mockClear();

    mocks.nativeClientEvent = { type: 'refreshClient' };
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
    expect(mocks.clerkInstance.setActive).toHaveBeenCalledWith({ session: 'sess_native' });
    expect(mocks.notifyNativeSessionChanged).toHaveBeenCalledTimes(1);
  });
});
