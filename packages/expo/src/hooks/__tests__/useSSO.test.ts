import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useSSO } from '../useSSO';

const mocks = vi.hoisted(() => {
  return {
    useSignIn: vi.fn(),
    useSignUp: vi.fn(),
    openAuthSessionAsync: vi.fn(),
    loadSSODependencies: vi.fn(),
  };
});

vi.mock('@clerk/react/legacy', () => {
  return {
    useSignIn: mocks.useSignIn,
    useSignUp: mocks.useSignUp,
  };
});

vi.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
    },
  };
});

vi.mock('../ssoDependencies', () => {
  return {
    loadSSODependencies: mocks.loadSSODependencies,
  };
});

describe('useSSO', () => {
  const mockSignIn = {
    supportedFirstFactors: [] as { strategy: string; enterpriseConnectionId?: string }[],
    prepareFirstFactor: vi.fn(),
    create: vi.fn(),
    firstFactorVerification: {
      externalVerificationRedirectURL: new URL('https://accounts.example.com/sso'),
    },
  };

  const mockSignUp = {
    create: vi.fn(),
    createdSessionId: null,
  };

  const mockSetActive = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.supportedFirstFactors = [];

    mocks.loadSSODependencies.mockReturnValue({
      AuthSession: {
        makeRedirectUri: () => 'myapp://sso-callback',
      },
      WebBrowser: {
        openAuthSessionAsync: mocks.openAuthSessionAsync,
      },
    });
    mocks.openAuthSessionAsync.mockResolvedValue({ type: 'cancel' });

    mocks.useSignIn.mockReturnValue({
      signIn: mockSignIn,
      setActive: mockSetActive,
      isLoaded: true,
    });

    mocks.useSignUp.mockReturnValue({
      signUp: mockSignUp,
      isLoaded: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('returns the startSSOFlow function', () => {
    const { result } = renderHook(() => useSSO());

    expect(typeof result.current.startSSOFlow).toBe('function');
    expect(mocks.loadSSODependencies).not.toHaveBeenCalled();
  });

  test('returns early without starting the flow when Clerk is not loaded', async () => {
    mocks.useSignIn.mockReturnValue({
      signIn: mockSignIn,
      setActive: mockSetActive,
      isLoaded: false,
    });

    const { result } = renderHook(() => useSSO());

    const response = await result.current.startSSOFlow({ strategy: 'oauth_google' });

    expect(mocks.loadSSODependencies).not.toHaveBeenCalled();
    expect(mockSignIn.create).not.toHaveBeenCalled();
    expect(mocks.openAuthSessionAsync).not.toHaveBeenCalled();
    expect(response.createdSessionId).toBe(null);
  });

  test('surfaces the underlying error when an auth-session dependency fails to load', async () => {
    const error = new Error('Unable to load expo-auth-session');
    mocks.loadSSODependencies.mockImplementationOnce(() => {
      throw error;
    });
    const { result } = renderHook(() => useSSO());

    await expect(result.current.startSSOFlow({ strategy: 'oauth_google' })).rejects.toBe(error);
    expect(mockSignIn.create).not.toHaveBeenCalled();
  });

  test.each([{ strategy: 'oauth_google', oidcPrompt: 'select_account', oidcLoginHint: 'user@example.com' }] as const)(
    'forwards SSO options to sign-in creation: %j',
    async params => {
      const { result } = renderHook(() => useSSO());

      await result.current.startSSOFlow(params);

      expect(mockSignIn.create).toHaveBeenCalledWith({
        ...params,
        redirectUrl: 'myapp://sso-callback',
      });
    },
  );
  test('returns enterprise connections before opening the browser when selection is required', async () => {
    mockSignIn.supportedFirstFactors = [
      { strategy: 'enterprise_sso', enterpriseConnectionId: 'ec_1' },
      { strategy: 'enterprise_sso', enterpriseConnectionId: 'ec_2' },
    ];
    const { result } = renderHook(() => useSSO());
    const response = await result.current.startSSOFlow({
      strategy: 'enterprise_sso',
      identifier: 'user@example.com',
    });
    expect(mockSignIn.create).toHaveBeenCalledWith({ identifier: 'user@example.com' });
    expect(mockSignIn.prepareFirstFactor).not.toHaveBeenCalled();
    expect(mocks.openAuthSessionAsync).not.toHaveBeenCalled();
    expect(response).toMatchObject({ createdSessionId: null, authSessionResult: null, signIn: mockSignIn });
  });

  test.each([undefined, 'ec_2'])('prepares the selected enterprise connection %s', async enterpriseConnectionId => {
    const { result } = renderHook(() => useSSO());
    await result.current.startSSOFlow({
      strategy: 'enterprise_sso',
      identifier: 'user@example.com',
      enterpriseConnectionId,
      oidcPrompt: 'consent',
    });
    expect(mockSignIn.create).toHaveBeenCalledWith({ identifier: 'user@example.com' });
    expect(mockSignIn.prepareFirstFactor).toHaveBeenCalledWith({
      strategy: 'enterprise_sso',
      enterpriseConnectionId,
      redirectUrl: 'myapp://sso-callback',
      oidcPrompt: 'consent',
    });
    expect(mocks.openAuthSessionAsync).toHaveBeenCalledOnce();
  });

  test('preserves enterprise preparation errors', async () => {
    const error = new Error('Invalid enterprise connection');
    mockSignIn.prepareFirstFactor.mockRejectedValueOnce(error);
    const { result } = renderHook(() => useSSO());
    await expect(
      result.current.startSSOFlow({
        strategy: 'enterprise_sso',
        identifier: 'user@example.com',
        enterpriseConnectionId: 'ec_missing',
      }),
    ).rejects.toBe(error);
    expect(mocks.openAuthSessionAsync).not.toHaveBeenCalled();
  });
});
