import Module from 'node:module';

import type { ClientJSON } from '@clerk/shared/types';
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
    platformOS: 'ios',
    appOwnership: null as string | null,
    executionEnvironment: 'standalone',
    expoConfig: undefined as
      | {
          ios?: { bundleIdentifier?: string };
          android?: { package?: string };
        }
      | undefined,
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
      get OS() {
        return mocks.platformOS;
      },
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
    lastActiveSessionId: null as string | null,
    sessions: [] as Array<{ id: string }>,
    reload: vi.fn(),
    fromJSON: vi.fn(),
  };
  const mockSetActive = vi.fn();
  const mockHandleUnauthenticated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFapiRequest.mockReset();
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
      if (request === 'expo-constants') {
        return {
          default: {
            appOwnership: mocks.appOwnership,
            executionEnvironment: mocks.executionEnvironment,
            expoConfig: mocks.expoConfig,
          },
        };
      }
      return originalModuleLoad.call(Module, request, parent, isMain);
    });
    mocks.platformOS = 'ios';
    mocks.appOwnership = null;
    mocks.executionEnvironment = 'standalone';
    mocks.expoConfig = undefined;
    mockClient.lastActiveSessionId = null;
    mockClient.sessions = [];
    mockClient.fromJSON.mockImplementation((clientJSON: ClientJSON) => {
      mockClient.lastActiveSessionId = clientJSON.last_active_session_id;
      mockClient.sessions = clientJSON.sessions.map(session => ({ id: session.id }));
      return mockClient;
    });
    mocks.makeRedirectUri.mockReturnValue('myapp:///hosted-auth-callback');
    mocks.getRandomBytes.mockReturnValue(Uint8Array.from(Array.from({ length: 32 }, (_, index) => index)));
    mocks.digestStringAsync.mockResolvedValue('mock-code-challenge+/=');
    mocks.randomUUID.mockReturnValue('generated-state-123');
    mocks.getClerkInstance.mockReturnValue({
      handleUnauthenticated: mockHandleUnauthenticated,
      getFapiClient: () => ({
        request: mockFapiRequest,
      }),
    });
    mocks.useClerk.mockReturnValue({
      loaded: true,
      client: mockClient,
      setActive: mockSetActive,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('returns the startHostedAuth function', () => {
    const { result } = renderHook(() => useHostedAuth());

    expect(typeof result.current.startHostedAuth).toBe('function');
  });

  test('uses the native Clerk instance for FAPI requests', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({ type: 'dismiss' });

    const { result } = renderHook(() => useHostedAuth());
    await result.current.startHostedAuth();

    expect(mocks.getClerkInstance).toHaveBeenCalledTimes(1);
    expect(mockFapiRequest).toHaveBeenCalledWith(expect.objectContaining({ path: '/client/hosted_auth' }));
  });

  test('opens the hosted URL and verifies callback state', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'myapp:///hosted-auth-callback?state=generated-state-123&rotating_token_nonce=nonce-123&created_session_id=sess_123',
    });
    mockHostedAuthRedeemResponse({ lastActiveSessionId: 'sess_123' });

    const { result } = renderHook(() => useHostedAuth());
    const response = await result.current.startHostedAuth();

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
    expect(mockFapiRequest).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      path: '/client',
      body: {
        _method: 'GET',
        rotatingTokenNonce: 'nonce-123',
        codeVerifier: mockCodeVerifier,
      },
    });
    expect(mockClient.fromJSON).toHaveBeenCalledWith(expect.objectContaining({ object: 'client' }));
    expect(mockSetActive).toHaveBeenCalledTimes(1);
    expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_123' });
    expect(response.createdSessionId).toBe('sess_123');
  });

  test.each([
    {
      platform: 'ios',
      expoConfig: { ios: { bundleIdentifier: 'com.example.ios' } },
      redirectUrl: 'com.example.ios://callback',
    },
    {
      platform: 'android',
      expoConfig: { android: { package: 'com.example.android' } },
      redirectUrl: 'clerk://com.example.android.callback',
    },
  ])('uses the canonical $platform callback registered by Clerk', async ({ platform, expoConfig, redirectUrl }) => {
    mocks.platformOS = platform;
    mocks.expoConfig = expoConfig;
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: `${redirectUrl}?state=generated-state-123&rotating_token_nonce=nonce-123&created_session_id=sess_123`,
    });
    mockHostedAuthRedeemResponse({ lastActiveSessionId: 'sess_123' });

    const { result } = renderHook(() => useHostedAuth());
    await result.current.startHostedAuth();

    expect(mockFapiRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/client/hosted_auth',
      body: {
        redirectUrl,
        codeChallenge: mockCodeChallenge,
        mode: undefined,
        state: 'generated-state-123',
      },
    });
    expect(mocks.openAuthSessionAsync).toHaveBeenCalledWith(
      'https://example.accounts.dev/sign-in',
      redirectUrl,
      undefined,
    );
    expect(mocks.makeRedirectUri).not.toHaveBeenCalled();
  });

  test('uses the Expo callback in Expo Go even when the project config has a bundle identifier', async () => {
    const redirectUrl = 'exp://127.0.0.1:8081/--/hosted-auth-callback';
    mocks.executionEnvironment = 'storeClient';
    mocks.expoConfig = { ios: { bundleIdentifier: 'com.example.ios' } };
    mocks.makeRedirectUri.mockReturnValue(redirectUrl);
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({ type: 'dismiss' });

    const { result } = renderHook(() => useHostedAuth());
    await result.current.startHostedAuth();

    expect(mocks.makeRedirectUri).toHaveBeenCalledWith({
      path: 'hosted-auth-callback',
      isTripleSlashed: true,
    });
    expect(mockFapiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ redirectUrl }),
      }),
    );
  });

  test('uses the Expo callback with older Expo Go ownership metadata', async () => {
    mocks.executionEnvironment = '';
    mocks.appOwnership = 'expo';
    mocks.expoConfig = { android: { package: 'com.example.android' } };
    mocks.platformOS = 'android';
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({ type: 'dismiss' });

    const { result } = renderHook(() => useHostedAuth());
    await result.current.startHostedAuth();

    expect(mocks.makeRedirectUri).toHaveBeenCalled();
  });

  test('passes supported browser options to the auth session', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({ type: 'dismiss' });

    const { result } = renderHook(() => useHostedAuth());
    await result.current.startHostedAuth({ authSessionOptions: { showInRecents: true } });

    expect(mocks.openAuthSessionAsync).toHaveBeenCalledWith(
      'https://example.accounts.dev/sign-in',
      'myapp:///hosted-auth-callback',
      { showInRecents: true },
    );
  });

  test('rejects HTTPS redirect URLs before creating hosted auth', async () => {
    const redirectUrl = 'https://mobile.example.com/hosted-auth-callback';

    const { result } = renderHook(() => useHostedAuth());
    await expect(result.current.startHostedAuth({ redirectUrl })).rejects.toThrow(
      'Hosted auth requires a custom-scheme redirect URL in Expo.',
    );

    expect(mockFapiRequest).not.toHaveBeenCalled();
    expect(mocks.openAuthSessionAsync).not.toHaveBeenCalled();
  });

  test('falls back to the reloaded client session when callback session id is absent', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'myapp:///hosted-auth-callback?state=generated-state-123&rotating_token_nonce=nonce-123',
    });
    mockHostedAuthRedeemResponse({ lastActiveSessionId: 'sess_reloaded' });

    const { result } = renderHook(() => useHostedAuth());
    const response = await result.current.startHostedAuth();

    expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_reloaded' });
    expect(response.createdSessionId).toBe('sess_reloaded');
  });

  test('rejects a redeemed client response without a created session', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'myapp:///hosted-auth-callback?state=generated-state-123&rotating_token_nonce=nonce-123',
    });
    mockHostedAuthRedeemResponse();

    const { result } = renderHook(() => useHostedAuth());

    await expect(result.current.startHostedAuth()).rejects.toThrow(
      'Hosted auth completion did not include the created session.',
    );

    expect(mockFapiRequest).toHaveBeenNthCalledWith(2, expect.objectContaining({ path: '/client' }));
    expect(mockClient.fromJSON).not.toHaveBeenCalled();
    expect(mockSetActive).not.toHaveBeenCalled();
  });

  test('rejects a successful callback without a rotating token nonce', async () => {
    mockClient.lastActiveSessionId = 'sess_existing';
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'myapp:///hosted-auth-callback?state=generated-state-123',
    });

    const { result } = renderHook(() => useHostedAuth());

    await expect(result.current.startHostedAuth()).rejects.toThrow(
      'Hosted auth callback did not include a rotating token nonce.',
    );

    expect(mockFapiRequest).toHaveBeenCalledTimes(1);
    expect(mockSetActive).not.toHaveBeenCalled();
  });

  test('rejects a callback session that is absent from the redeemed client', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'myapp:///hosted-auth-callback?state=generated-state-123&rotating_token_nonce=nonce-123&created_session_id=sess_other',
    });
    mockHostedAuthRedeemResponse({ lastActiveSessionId: 'sess_123' });

    const { result } = renderHook(() => useHostedAuth());

    await expect(result.current.startHostedAuth()).rejects.toThrow(
      'Hosted auth completion did not include the created session.',
    );
    expect(mockClient.fromJSON).not.toHaveBeenCalled();
    expect(mockSetActive).not.toHaveBeenCalled();
  });

  test('surfaces browser session open failures', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockImplementation(() => {
      throw new Error('Unable to open browser');
    });

    const { result } = renderHook(() => useHostedAuth());

    await expect(result.current.startHostedAuth()).rejects.toThrow('Unable to open browser');
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

    await expect(result.current.startHostedAuth()).rejects.toThrow(
      'Hosted auth callback state did not match the initiated state.',
    );
  });

  test('passes through the requested mode', async () => {
    mockHostedAuthResponse('https://example.accounts.dev/sign-up');
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'dismiss',
    });

    const { result } = renderHook(() => useHostedAuth());
    await result.current.startHostedAuth({ mode: 'sign-up' });

    expect(mockFapiRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/client/hosted_auth',
      body: {
        redirectUrl: 'myapp:///hosted-auth-callback',
        codeChallenge: mockCodeChallenge,
        mode: 'sign-up',
        state: 'generated-state-123',
      },
    });
  });

  test('rejects callback URL mismatches', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'otherapp://hosted-auth-callback?state=generated-state-123',
    });

    const { result } = renderHook(() => useHostedAuth());

    await expect(result.current.startHostedAuth()).rejects.toThrow(
      'Hosted auth callback URL did not match the initiated redirect URL.',
    );
  });

  test('rejects malformed callback URLs with a hosted auth error', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: '://not-a-url',
    });

    const { result } = renderHook(() => useHostedAuth());

    await expect(result.current.startHostedAuth()).rejects.toThrow('Hosted auth callback URL was invalid.');
  });

  test('rejects callback path mismatches', async () => {
    mocks.makeRedirectUri.mockReturnValue('exp://127.0.0.1:8081/--/hosted-auth-callback');
    mockHostedAuthResponse('https://example.accounts.dev/sign-in');
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'exp://127.0.0.1:8081/--/other-callback?state=generated-state-123',
    });

    const { result } = renderHook(() => useHostedAuth());

    await expect(result.current.startHostedAuth()).rejects.toThrow(
      'Hosted auth callback URL did not match the initiated redirect URL.',
    );
  });

  test('rejects callback authority mismatches for triple-slashed redirect URLs', async () => {
    mockHostedAuthResponse();
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'myapp://attacker/hosted-auth-callback?state=generated-state-123',
    });

    const { result } = renderHook(() => useHostedAuth());

    await expect(result.current.startHostedAuth()).rejects.toThrow(
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

    await expect(result.current.startHostedAuth()).rejects.toThrow(
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

    await expect(result.current.startHostedAuth()).rejects.toThrow('Redirect URL is invalid');
    expect(mocks.openAuthSessionAsync).not.toHaveBeenCalled();
  });

  test('reconciles Clerk state when hosted auth returns an unauthenticated response', async () => {
    mockFapiRequest.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      payload: {
        errors: [],
      },
    });

    const { result } = renderHook(() => useHostedAuth());

    await expect(result.current.startHostedAuth()).rejects.toThrow('Unauthorized');
    expect(mockHandleUnauthenticated).toHaveBeenCalledTimes(1);
  });
});

function mockHostedAuthResponse(url = 'https://example.accounts.dev/sign-in') {
  mockFapiRequest.mockResolvedValueOnce({
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

function mockHostedAuthRedeemResponse({
  lastActiveSessionId = null,
  sessionIds = lastActiveSessionId ? [lastActiveSessionId] : [],
}: {
  lastActiveSessionId?: string | null;
  sessionIds?: string[];
} = {}) {
  mockFapiRequest.mockResolvedValueOnce({
    ok: true,
    status: 200,
    statusText: 'OK',
    payload: {
      response: {
        object: 'client',
        id: 'client_123',
        sessions: sessionIds.map(id => ({ id })),
        sign_in: null,
        sign_up: null,
        last_active_session_id: lastActiveSessionId,
        captcha_bypass: false,
        cookie_expires_at: null,
        last_authentication_strategy: null,
        created_at: Date.now() - 1000,
        updated_at: Date.now(),
      } as unknown as ClientJSON,
    },
  });
}
