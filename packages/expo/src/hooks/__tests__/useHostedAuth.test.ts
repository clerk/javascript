import Module from 'node:module';

import { renderHook } from '@testing-library/react';
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
    digestStringAsync: vi.fn(),
    getRandomBytes: vi.fn(),
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
    CryptoDigestAlgorithm: {
      SHA256: 'SHA256',
    },
    CryptoEncoding: {
      BASE64: 'BASE64',
    },
    digestStringAsync: mocks.digestStringAsync,
    getRandomBytes: mocks.getRandomBytes,
    randomUUID: mocks.randomUUID,
  };
});

const mockFapiRequest = vi.fn();
const mockCodeVerifier = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
const mockCodeChallenge = 'mock-code-challenge-_';

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
        return {
          CryptoDigestAlgorithm: {
            SHA256: 'SHA256',
          },
          CryptoEncoding: {
            BASE64: 'BASE64',
          },
          digestStringAsync: mocks.digestStringAsync,
          getRandomBytes: mocks.getRandomBytes,
          randomUUID: mocks.randomUUID,
        };
      }
      return originalModuleLoad.call(Module, request, parent, isMain);
    });
    mockClient.lastActiveSessionId = null;
    mocks.makeRedirectUri.mockReturnValue('myapp:///hosted-auth-callback');
    mocks.getRandomBytes.mockReturnValue(Uint8Array.from(Array.from({ length: 32 }, (_, index) => index)));
    mocks.digestStringAsync.mockResolvedValue('mock-code-challenge+/=');
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
        codeChallenge: mockCodeChallenge,
        mode: undefined,
        state: 'state-123',
      },
    });
    expect(mocks.makeRedirectUri).toHaveBeenCalledWith({
      path: 'hosted-auth-callback',
      isTripleSlashed: true,
    });
    expect(mocks.digestStringAsync).toHaveBeenCalledWith('SHA256', mockCodeVerifier, {
      encoding: 'BASE64',
    });
    expect(mocks.openAuthSessionAsync).toHaveBeenCalledWith(
      'https://example.accounts.dev/sign-in',
      'myapp:///hosted-auth-callback',
      undefined,
    );
    expect(mockClient.reload).toHaveBeenCalledWith({
      rotatingTokenNonce: 'nonce-123',
      codeVerifier: mockCodeVerifier,
    });
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

    expect(mockClient.reload).toHaveBeenCalledWith({
      rotatingTokenNonce: 'nonce-123',
      codeVerifier: mockCodeVerifier,
    });
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
        codeChallenge: mockCodeChallenge,
        mode: undefined,
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

  test('passes through the requested mode', async () => {
    mockHostedAuthResponse('https://example.accounts.dev/sign-up');
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'dismiss',
    });

    const { result } = renderHook(() => useHostedAuth());
    await result.current.startHostedAuth({ mode: 'sign-up', state: 'state-123' });

    expect(mockFapiRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/client/hosted_auth',
      body: {
        redirectUrl: 'myapp:///hosted-auth-callback',
        codeChallenge: mockCodeChallenge,
        mode: 'sign_up',
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

  test('rejects callback authority mismatches for triple-slashed redirect URLs', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'myapp://attacker/hosted-auth-callback?state=state-123',
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
