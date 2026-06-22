import { renderHook } from '@testing-library/react';
import Module from 'node:module';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useHostedAuth } from '../useHostedAuth';

const moduleWithLoad = Module as unknown as {
  _load: (request: string, parent?: unknown, isMain?: boolean) => unknown;
};
const originalModuleLoad = moduleWithLoad._load;

const mocks = vi.hoisted(() => {
  return {
    makeRedirectUri: vi.fn(),
    openAuthSessionAsync: vi.fn(),
    randomUUID: vi.fn(),
    useClerk: vi.fn(),
    getClerkInstance: vi.fn(),
  };
});

vi.mock('@clerk/react', () => {
  return {
    useClerk: mocks.useClerk,
  };
});

vi.mock('../../provider/singleton', () => {
  return {
    getClerkInstance: mocks.getClerkInstance,
  };
});

vi.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
    },
  };
});

vi.mock('expo-auth-session', () => {
  return {
    makeRedirectUri: mocks.makeRedirectUri,
  };
});

vi.mock('expo-web-browser', () => {
  return {
    openAuthSessionAsync: mocks.openAuthSessionAsync,
  };
});

vi.mock('expo-crypto', () => {
  return {
    randomUUID: mocks.randomUUID,
  };
});

const mockFapiRequest = vi.fn();

describe('useHostedAuth', () => {
  const mockClient = {
    lastActiveSessionId: null,
    reload: vi.fn(),
  };
  const mockUpdateClient = vi.fn();
  const mockSetActive = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(moduleWithLoad, '_load').mockImplementation((request, parent, isMain) => {
      if (request === 'expo-auth-session') {
        return { makeRedirectUri: mocks.makeRedirectUri };
      }
      if (request === 'expo-web-browser') {
        return {
          openAuthSessionAsync: mocks.openAuthSessionAsync,
        };
      }
      if (request === 'expo-crypto') {
        return { randomUUID: mocks.randomUUID };
      }
      return originalModuleLoad.call(Module, request, parent, isMain);
    });
    mockClient.lastActiveSessionId = null;
    mocks.makeRedirectUri.mockReturnValue('myapp:///hosted-auth-callback');
    mocks.randomUUID.mockReturnValue('generated-state-123');
    mocks.useClerk.mockReturnValue({
      loaded: true,
      client: mockClient,
      setActive: mockSetActive,
      updateClient: mockUpdateClient,
    });
    mocks.getClerkInstance.mockReturnValue({
      getFapiClient: () => ({
        request: mockFapiRequest,
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('returns the startHostedAuth function', () => {
    const { result } = renderHook(() => useHostedAuth());

    expect(typeof result.current.startHostedAuth).toBe('function');
  });

  test('opens the hosted URL and verifies callback state', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'myapp:///hosted-auth-callback?state=state-123&rotating_token_nonce=nonce-123&created_session_id=sess_123',
    });
    mockClient.reload.mockResolvedValue(mockClient);

    const { result } = renderHook(() => useHostedAuth());
    const response = await result.current.startHostedAuth({ state: 'state-123' });

    expect(mockFapiRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/client/hosted_auth',
      body: {
        redirectUrl: 'myapp:///hosted-auth-callback',
        initialPage: undefined,
        state: 'state-123',
      },
    });
    expect(mocks.makeRedirectUri).toHaveBeenCalledWith({
      path: 'hosted-auth-callback',
      isTripleSlashed: true,
    });
    expect(mocks.openAuthSessionAsync).toHaveBeenCalledWith(
      'https://example.accounts.dev/sign-in',
      'myapp:///hosted-auth-callback',
      undefined,
    );
    expect(mockClient.reload).toHaveBeenCalledWith({ rotatingTokenNonce: 'nonce-123' });
    expect(mockUpdateClient).toHaveBeenCalledWith(mockClient);
    expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_123' });
    expect(response.createdSessionId).toBe('sess_123');
  });

  test('does not activate a session when the callback does not return one', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'myapp:///hosted-auth-callback?state=state-123&rotating_token_nonce=nonce-123',
    });
    mockClient.reload.mockResolvedValue(mockClient);

    const { result } = renderHook(() => useHostedAuth());
    const response = await result.current.startHostedAuth({ state: 'state-123' });

    expect(mockClient.reload).toHaveBeenCalledWith({ rotatingTokenNonce: 'nonce-123' });
    expect(mockUpdateClient).toHaveBeenCalledWith(mockClient);
    expect(mockSetActive).not.toHaveBeenCalled();
    expect(response.createdSessionId).toBeNull();
  });

  test('surfaces browser session open failures', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockImplementation(() => {
      throw new Error('Unable to open browser');
    });

    const { result } = renderHook(() => useHostedAuth());

    await expect(result.current.startHostedAuth({ state: 'state-123' })).rejects.toThrow('Unable to open browser');
  });

  test('generates a secure state with expo-crypto when one is not provided', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'dismiss',
    });

    const { result } = renderHook(() => useHostedAuth());
    await result.current.startHostedAuth();

    expect(mocks.randomUUID).toHaveBeenCalled();
    expect(mockFapiRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/client/hosted_auth',
      body: {
        redirectUrl: 'myapp:///hosted-auth-callback',
        initialPage: undefined,
        state: 'generated-state-123',
      },
    });
  });

  test('rejects callback state mismatches', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'myapp:///hosted-auth-callback?state=other-state',
    });

    const { result } = renderHook(() => useHostedAuth());

    await expect(result.current.startHostedAuth({ state: 'state-123' })).rejects.toThrow(
      'Hosted auth callback state did not match the initiated state.',
    );
  });

  test('passes through the requested initial page', async () => {
    mockHostedAuthResponse('https://example.accounts.dev/sign-up');
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'dismiss',
    });

    const { result } = renderHook(() => useHostedAuth());
    await result.current.startHostedAuth({ initialPage: 'sign-up', state: 'state-123' });

    expect(mockFapiRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/client/hosted_auth',
      body: {
        redirectUrl: 'myapp:///hosted-auth-callback',
        initialPage: 'sign_up',
        state: 'state-123',
      },
    });
  });

  test('rejects callback URL mismatches', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'otherapp://hosted-auth-callback?state=state-123',
    });

    const { result } = renderHook(() => useHostedAuth());

    await expect(result.current.startHostedAuth({ state: 'state-123' })).rejects.toThrow(
      'Hosted auth callback URL did not match the initiated redirect URL.',
    );
  });

  test('rejects callback path mismatches', async () => {
    mocks.makeRedirectUri.mockReturnValue('exp://127.0.0.1:8081/--/hosted-auth-callback');
    mockHostedAuthResponse('https://example.accounts.dev/sign-in');
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'exp://127.0.0.1:8081/--/other-callback?state=state-123',
    });

    const { result } = renderHook(() => useHostedAuth());

    await expect(result.current.startHostedAuth({ state: 'state-123' })).rejects.toThrow(
      'Hosted auth callback URL did not match the initiated redirect URL.',
    );
  });

  test('rejects invalid hosted auth responses', async () => {
    mockFapiRequest.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      payload: {
        response: {
          object: 'hosted_auth',
        },
      },
    });

    const { result } = renderHook(() => useHostedAuth());

    await expect(result.current.startHostedAuth({ state: 'state-123' })).rejects.toThrow(
      'Hosted auth creation returned an invalid response.',
    );
    expect(mocks.openAuthSessionAsync).not.toHaveBeenCalled();
  });

  test('surfaces hosted auth FAPI errors', async () => {
    mockFapiRequest.mockResolvedValue({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      payload: {
        errors: [
          {
            code: 'form_param_format_invalid',
            message: 'Redirect URL is invalid',
            long_message: 'Redirect URL is invalid',
            meta: {},
          },
        ],
      },
    });

    const { result } = renderHook(() => useHostedAuth());

    await expect(result.current.startHostedAuth({ state: 'state-123' })).rejects.toThrow('Redirect URL is invalid');
    expect(mocks.openAuthSessionAsync).not.toHaveBeenCalled();
  });
});

function mockHostedAuthResponse(url = 'https://example.accounts.dev/sign-in') {
  mockFapiRequest.mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    payload: {
      response: {
        object: 'hosted_auth',
        url,
      },
    },
  });
}
