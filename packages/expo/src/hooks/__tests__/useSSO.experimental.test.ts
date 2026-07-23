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
    createdSessionId: null as string | null,
    firstFactorVerification: {
      externalVerificationRedirectURL: new URL('https://accounts.example.com/sso'),
      status: 'unverified' as string | null,
    },
  };
  const mockSignUp = {
    create: vi.fn(),
    createdSessionId: null as string | null,
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
    mockSignIn.firstFactorVerification.externalVerificationRedirectURL = new URL('https://accounts.example.com/sso');
    mockSignIn.firstFactorVerification.status = 'unverified';
    mockSignIn.create.mockResolvedValue({ error: null });
    mockClientSignIn.reload.mockImplementation(({ rotatingTokenNonce }) => {
      if (rotatingTokenNonce === 'nonce_123') {
        mockSignIn.firstFactorVerification.status = 'verified';
        mockSignIn.createdSessionId = 'sess_123';
      }

      return Promise.resolve();
    });

    mockSignUp.createdSessionId = null;
    mockSignUp.create.mockResolvedValue({ error: null });

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
    expect(response.setActive).toBe(mockSetActive);
    expect(response.signIn).toBe(mockSignIn);
    expect(response.signUp).toBe(mockSignUp);
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
    expect(response).toMatchObject({
      createdSessionId: 'sess_123',
      authSessionResult: {
        type: 'success',
        url: 'myapp://sso-callback?rotating_token_nonce=nonce_123',
      },
      setActive: mockSetActive,
      signIn: mockSignIn,
      signUp: mockSignUp,
    });
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
    mockClientSignIn.reload.mockImplementation(() => {
      mockSignIn.firstFactorVerification.status = 'transferable';
      return Promise.resolve();
    });
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
    expect(response.createdSessionId).toBe('sess_signup');
  });

  test('returns without reloading when the browser auth session is dismissed', async () => {
    mocks.openAuthSessionAsync.mockResolvedValue({
      type: 'dismiss',
    });

    const { result } = renderHook(() => useSSO());

    const response = await result.current.startSSOFlow({ strategy: 'oauth_google' });

    expect(mockClientSignIn.reload).not.toHaveBeenCalled();
    expect(response.createdSessionId).toBe(null);
    expect(response.authSessionResult).toEqual({ type: 'dismiss' });
  });

  test('surfaces future sign-in create errors', async () => {
    mockSignIn.create.mockResolvedValue({ error: new Error('sign-in failed') });

    const { result } = renderHook(() => useSSO());

    await expect(result.current.startSSOFlow({ strategy: 'oauth_google' })).rejects.toThrow('sign-in failed');
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
