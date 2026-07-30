import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useSSO as experimentalUseSSO } from '../../experimental';
import { useSSO } from '../useSSO.experimental';

const mocks = vi.hoisted(() => {
  return {
    useClerk: vi.fn(),
    useSignIn: vi.fn(),
    useSignUp: vi.fn(),
    makeRedirectUri: vi.fn(),
    openAuthSessionAsync: vi.fn(),
    loadSSODependencies: vi.fn(),
  };
});

vi.mock('@clerk/react', () => {
  return {
    useClerk: mocks.useClerk,
    useSignIn: mocks.useSignIn,
    useSignUp: mocks.useSignUp,
  };
});

vi.mock('../ssoDependencies', () => {
  return {
    loadSSODependencies: mocks.loadSSODependencies,
  };
});

vi.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
    },
  };
});

describe('experimental useSSO', () => {
  const mockSetActive = vi.fn();
  const mockClientSignIn = {
    reload: vi.fn(),
  };
  const mockSignIn = {
    create: vi.fn(),
    finalize: vi.fn(),
    createdSessionId: null as string | null,
    existingSession: null as { sessionId: string } | null,
    firstFactorVerification: {
      externalVerificationRedirectURL: new URL('https://accounts.example.com/sso'),
      status: 'unverified' as string | null,
    },
  };
  const mockSignUp = {
    create: vi.fn(),
    finalize: vi.fn(),
    createdSessionId: null as string | null,
    existingSession: null as { sessionId: string } | null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.makeRedirectUri.mockReturnValue('myapp://sso-callback');
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'myapp://sso-callback?rotating_token_nonce=nonce_123',
    });
    mocks.loadSSODependencies.mockReturnValue({
      AuthSession: {
        makeRedirectUri: mocks.makeRedirectUri,
      },
      WebBrowser: {
        openAuthSessionAsync: mocks.openAuthSessionAsync,
      },
    });

    mockSignIn.createdSessionId = null;
    mockSignIn.existingSession = null;
    mockSignIn.firstFactorVerification.externalVerificationRedirectURL = new URL('https://accounts.example.com/sso');
    mockSignIn.firstFactorVerification.status = 'unverified';
    mockSignIn.create.mockResolvedValue({ error: null });
    mockSignIn.finalize.mockResolvedValue({ error: null });
    mockClientSignIn.reload.mockImplementation(({ rotatingTokenNonce }) => {
      if (rotatingTokenNonce === 'nonce_123') {
        mockSignIn.firstFactorVerification.status = 'verified';
        mockSignIn.createdSessionId = 'sess_123';
      }

      return Promise.resolve({ __internal_future: mockSignIn });
    });

    mockSignUp.createdSessionId = null;
    mockSignUp.existingSession = null;
    mockSignUp.create.mockResolvedValue({ error: null });
    mockSignUp.finalize.mockResolvedValue({ error: null });

    mocks.useClerk.mockReturnValue({
      loaded: true,
      setActive: mockSetActive,
      client: {
        signIn: mockClientSignIn,
      },
    });
    mocks.useSignIn.mockReturnValue({
      signIn: mockSignIn,
      fetchStatus: 'idle',
      errors: {},
    });
    mocks.useSignUp.mockReturnValue({
      signUp: mockSignUp,
      fetchStatus: 'idle',
      errors: {},
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('exports useSSO from the experimental entrypoint', () => {
    expect(experimentalUseSSO).toBe(useSSO);
  });

  test('returns the startSSOFlow function', () => {
    const { result } = renderHook(() => useSSO());

    expect(typeof result.current.startSSOFlow).toBe('function');
    expect(mocks.useSignIn).toHaveBeenCalled();
    expect(mocks.useSignUp).toHaveBeenCalled();
  });

  test('returns early without starting the flow when Clerk is not loaded', async () => {
    mocks.useClerk.mockReturnValue({
      loaded: false,
      setActive: mockSetActive,
      client: null,
    });

    const { result } = renderHook(() => useSSO());

    const response = await result.current.startSSOFlow({ strategy: 'oauth_google' });

    expect(mockSignIn.create).not.toHaveBeenCalled();
    expect(mocks.openAuthSessionAsync).not.toHaveBeenCalled();
    expect(response.createdSessionId).toBe(null);
    expect(response.signIn).toBe(mockSignIn);
    expect(response.signUp).toBe(mockSignUp);
    expect(response).not.toHaveProperty('setActive');
  });

  test('starts OAuth SSO with future sign-in hooks and reloads the underlying client with the callback nonce', async () => {
    const { result } = renderHook(() => useSSO());

    const response = await result.current.startSSOFlow({
      strategy: 'oauth_google',
      authSessionOptions: { showInRecents: true },
    });

    expect(mockSignIn.create).toHaveBeenCalledWith({
      strategy: 'oauth_google',
      redirectUrl: 'myapp://sso-callback',
    });
    expect(mocks.openAuthSessionAsync).toHaveBeenCalledWith(
      'https://accounts.example.com/sso',
      'myapp://sso-callback',
      { showInRecents: true },
    );
    expect(mockClientSignIn.reload).toHaveBeenCalledWith({ rotatingTokenNonce: 'nonce_123' });
    expect(mockSignIn.finalize).toHaveBeenCalledOnce();
    expect(response).toMatchObject({
      createdSessionId: 'sess_123',
      authSessionResult: {
        type: 'success',
        url: 'myapp://sso-callback?rotating_token_nonce=nonce_123',
      },
      signIn: mockSignIn,
      signUp: mockSignUp,
    });
    expect(response).not.toHaveProperty('setActive');
  });

  test('uses the reloaded sign-in future for callback state and finalization', async () => {
    const reloadedSignIn = {
      ...mockSignIn,
      createdSessionId: 'sess_reloaded',
      firstFactorVerification: {
        ...mockSignIn.firstFactorVerification,
        status: 'verified',
      },
      finalize: vi.fn().mockResolvedValue({ error: null }),
    };
    mockClientSignIn.reload.mockResolvedValue({ __internal_future: reloadedSignIn });
    const { result } = renderHook(() => useSSO());

    const response = await result.current.startSSOFlow({ strategy: 'oauth_google' });

    expect(reloadedSignIn.finalize).toHaveBeenCalledOnce();
    expect(mockSignIn.finalize).not.toHaveBeenCalled();
    expect(response.createdSessionId).toBe('sess_reloaded');
    expect(response.signIn).toBe(reloadedSignIn);
  });

  test('ignores a session retained by an unrelated sign-up resource', async () => {
    mockSignUp.createdSessionId = 'sess_stale_signup';
    const { result } = renderHook(() => useSSO());

    const response = await result.current.startSSOFlow({ strategy: 'oauth_google' });

    expect(mockSignIn.finalize).toHaveBeenCalledOnce();
    expect(mockSignUp.finalize).not.toHaveBeenCalled();
    expect(response.createdSessionId).toBe('sess_123');
  });

  test('passes an enterprise SSO identifier to sign-in creation', async () => {
    const { result } = renderHook(() => useSSO());

    await result.current.startSSOFlow({
      strategy: 'enterprise_sso',
      identifier: 'user@example.com',
    });

    expect(mockSignIn.create).toHaveBeenCalledWith({
      strategy: 'enterprise_sso',
      redirectUrl: 'myapp://sso-callback',
      identifier: 'user@example.com',
    });
  });

  test('creates a transfer sign-up with unsafe metadata when sign-in is transferable', async () => {
    const reloadedSignIn = {
      ...mockSignIn,
      firstFactorVerification: {
        ...mockSignIn.firstFactorVerification,
        status: 'transferable',
      },
    };
    mockClientSignIn.reload.mockResolvedValue({ __internal_future: reloadedSignIn });
    mockSignUp.create.mockImplementation(() => {
      mockSignUp.createdSessionId = 'sess_signup';
      return Promise.resolve({ error: null });
    });

    const unsafeMetadata = { source: 'mobile' };
    const { result } = renderHook(() => useSSO());

    const response = await result.current.startSSOFlow({
      strategy: 'oauth_google',
      unsafeMetadata,
    });

    expect(mockSignUp.create).toHaveBeenCalledWith({
      transfer: true,
      unsafeMetadata,
    });
    expect(mockSignUp.finalize).toHaveBeenCalledOnce();
    expect(response.createdSessionId).toBe('sess_signup');
    expect(response.signIn).toBe(reloadedSignIn);
  });

  test('activates an existing session without finalizing a future resource', async () => {
    const reloadedSignIn = {
      ...mockSignIn,
      existingSession: { sessionId: 'sess_existing' },
    };
    mockClientSignIn.reload.mockResolvedValue({ __internal_future: reloadedSignIn });

    const { result } = renderHook(() => useSSO());

    const response = await result.current.startSSOFlow({ strategy: 'oauth_google' });

    expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_existing' });
    expect(mockSignIn.finalize).not.toHaveBeenCalled();
    expect(mockSignUp.finalize).not.toHaveBeenCalled();
    expect(response.createdSessionId).toBe(null);
    expect(response.signIn).toBe(reloadedSignIn);
  });

  test('does not activate an existing session retained by an unrelated sign-up resource', async () => {
    mockClientSignIn.reload.mockResolvedValue({ __internal_future: mockSignIn });
    mockSignUp.existingSession = { sessionId: 'sess_stale_signup' };
    const { result } = renderHook(() => useSSO());

    const response = await result.current.startSSOFlow({ strategy: 'oauth_google' });

    expect(mockSetActive).not.toHaveBeenCalled();
    expect(mockSignIn.finalize).not.toHaveBeenCalled();
    expect(mockSignUp.finalize).not.toHaveBeenCalled();
    expect(response.createdSessionId).toBe(null);
  });

  test('returns without reloading when the browser auth session is dismissed', async () => {
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'dismiss',
    });

    const { result } = renderHook(() => useSSO());

    const response = await result.current.startSSOFlow({ strategy: 'oauth_google' });

    expect(mockClientSignIn.reload).not.toHaveBeenCalled();
    expect(mockSignIn.finalize).not.toHaveBeenCalled();
    expect(mockSignUp.finalize).not.toHaveBeenCalled();
    expect(response.createdSessionId).toBe(null);
    expect(response.authSessionResult).toEqual({ type: 'dismiss' });
  });

  test('preserves structured future sign-in create errors', async () => {
    const clerkError = Object.assign(new Error('sign-in failed'), {
      code: 'form_identifier_not_found',
      errors: [{ code: 'form_identifier_not_found' }],
    });
    mockSignIn.create.mockResolvedValue({ error: clerkError });

    const { result } = renderHook(() => useSSO());

    await expect(result.current.startSSOFlow({ strategy: 'oauth_google' })).rejects.toBe(clerkError);
    expect(mocks.openAuthSessionAsync).not.toHaveBeenCalled();
  });

  test('surfaces the underlying error when an auth-session dependency fails to load', async () => {
    mocks.loadSSODependencies.mockImplementation(() => {
      throw new Error(
        '@clerk/expo: Unable to load expo-auth-session and expo-web-browser, which are required for SSO: missing auth session. If they are not installed, run: npx expo install expo-auth-session expo-web-browser',
      );
    });

    const { result } = renderHook(() => useSSO());

    await expect(result.current.startSSOFlow({ strategy: 'oauth_google' })).rejects.toThrow(
      /required for SSO: missing auth session\. If they are not installed/s,
    );
  });
});
