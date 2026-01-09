import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useSignInWithGoogle } from '../useSignInWithGoogle.android';

const mocks = vi.hoisted(() => {
  return {
    useClerk: vi.fn(),
    ClerkGoogleOneTapSignIn: {
      configure: vi.fn(),
      presentExplicitSignIn: vi.fn(),
    },
    isSuccessResponse: vi.fn(),
    isClerkAPIResponseError: vi.fn(),
  };
});

vi.mock('@clerk/clerk-react', () => {
  return {
    useClerk: mocks.useClerk,
  };
});

vi.mock('@clerk/shared/error', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    isClerkAPIResponseError: mocks.isClerkAPIResponseError,
  };
});

vi.mock('../../google-one-tap', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    ClerkGoogleOneTapSignIn: mocks.ClerkGoogleOneTapSignIn,
    isSuccessResponse: mocks.isSuccessResponse,
  };
});

vi.mock('react-native', () => {
  return {
    Platform: {
      OS: 'android',
    },
  };
});

vi.mock('expo-modules-core', () => {
  return {
    EventEmitter: vi.fn(),
    requireNativeModule: vi.fn(),
  };
});

vi.mock('expo-constants', () => {
  return {
    default: {
      expoConfig: {
        extra: {
          EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID: 'mock-web-client-id.apps.googleusercontent.com',
        },
      },
    },
  };
});

vi.mock('expo-crypto', () => {
  return {
    randomUUID: vi.fn(() => 'mock-uuid-nonce'),
    digestStringAsync: vi.fn(() => Promise.resolve('mock-hashed-nonce')),
    CryptoDigestAlgorithm: {
      SHA256: 'SHA256',
    },
  };
});

describe('useSignInWithGoogle', () => {
  const mockSignIn = {
    create: vi.fn(),
    createdSessionId: 'test-session-id',
    firstFactorVerification: {
      status: 'verified',
    },
  };

  const mockSignUp = {
    create: vi.fn(),
    createdSessionId: null,
  };

  const mockSetActive = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useClerk.mockReturnValue({
      loaded: true,
      setActive: mockSetActive,
      client: {
        signIn: mockSignIn,
        signUp: mockSignUp,
      },
    });

    // Default to false - tests that need this can override
    mocks.isClerkAPIResponseError.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('startGoogleAuthenticationFlow', () => {
    test('should return the hook with startGoogleAuthenticationFlow function', () => {
      const { result } = renderHook(() => useSignInWithGoogle());

      expect(result.current).toHaveProperty('startGoogleAuthenticationFlow');
      expect(typeof result.current.startGoogleAuthenticationFlow).toBe('function');
    });

    test('should successfully sign in existing user', async () => {
      const mockIdToken = 'mock-id-token';
      mocks.ClerkGoogleOneTapSignIn.presentExplicitSignIn.mockResolvedValue({
        type: 'success',
        data: { idToken: mockIdToken },
      });
      mocks.isSuccessResponse.mockReturnValue(true);

      mockSignIn.create.mockResolvedValue(undefined);
      mockSignIn.firstFactorVerification.status = 'verified';
      mockSignIn.createdSessionId = 'test-session-id';

      const { result } = renderHook(() => useSignInWithGoogle());

      const response = await result.current.startGoogleAuthenticationFlow();

      expect(mocks.ClerkGoogleOneTapSignIn.configure).toHaveBeenCalledWith({
        webClientId: 'mock-web-client-id.apps.googleusercontent.com',
      });
      expect(mocks.ClerkGoogleOneTapSignIn.presentExplicitSignIn).toHaveBeenCalledWith({
        nonce: 'mock-uuid-nonce',
      });
      expect(mockSignIn.create).toHaveBeenCalledWith({
        strategy: 'google_one_tap',
        token: mockIdToken,
      });
      expect(response.createdSessionId).toBe('test-session-id');
      expect(response.setActive).toBe(mockSetActive);
    });

    test('should handle transfer flow for new user', async () => {
      const mockIdToken = 'mock-id-token';
      mocks.ClerkGoogleOneTapSignIn.presentExplicitSignIn.mockResolvedValue({
        type: 'success',
        data: { idToken: mockIdToken },
      });
      mocks.isSuccessResponse.mockReturnValue(true);

      mockSignIn.create.mockResolvedValue(undefined);
      mockSignIn.firstFactorVerification.status = 'transferable';

      const mockSignUpWithSession = { ...mockSignUp, createdSessionId: 'new-user-session-id' };
      mocks.useClerk.mockReturnValue({
        loaded: true,
        setActive: mockSetActive,
        client: {
          signIn: mockSignIn,
          signUp: mockSignUpWithSession,
        },
      });

      const { result } = renderHook(() => useSignInWithGoogle());

      const response = await result.current.startGoogleAuthenticationFlow({
        unsafeMetadata: { source: 'test' },
      });

      expect(mockSignIn.create).toHaveBeenCalledWith({
        strategy: 'google_one_tap',
        token: mockIdToken,
      });
      expect(mockSignUpWithSession.create).toHaveBeenCalledWith({
        transfer: true,
        unsafeMetadata: { source: 'test' },
      });
      expect(response.createdSessionId).toBe('new-user-session-id');
    });

    test('should handle user cancellation gracefully', async () => {
      mocks.ClerkGoogleOneTapSignIn.presentExplicitSignIn.mockResolvedValue({
        type: 'cancelled',
        data: null,
      });
      mocks.isSuccessResponse.mockReturnValue(false);

      const { result } = renderHook(() => useSignInWithGoogle());

      const response = await result.current.startGoogleAuthenticationFlow();

      expect(response.createdSessionId).toBe(null);
      expect(response.setActive).toBe(mockSetActive);
    });

    test('should handle SIGN_IN_CANCELLED error code', async () => {
      const cancelError = Object.assign(new Error('User canceled'), { code: 'SIGN_IN_CANCELLED' });
      mocks.ClerkGoogleOneTapSignIn.presentExplicitSignIn.mockRejectedValue(cancelError);

      const { result } = renderHook(() => useSignInWithGoogle());

      const response = await result.current.startGoogleAuthenticationFlow();

      expect(response.createdSessionId).toBe(null);
      expect(response.setActive).toBe(mockSetActive);
    });

    test('should return early when clerk is not loaded', async () => {
      mocks.useClerk.mockReturnValue({
        loaded: false,
        setActive: mockSetActive,
        client: null,
      });

      const { result } = renderHook(() => useSignInWithGoogle());

      const response = await result.current.startGoogleAuthenticationFlow();

      expect(mocks.ClerkGoogleOneTapSignIn.configure).not.toHaveBeenCalled();
      expect(mocks.ClerkGoogleOneTapSignIn.presentExplicitSignIn).not.toHaveBeenCalled();
      expect(response.createdSessionId).toBe(null);
    });

    test('should fall back to signUp when external_account_not_found error occurs', async () => {
      const mockIdToken = 'mock-id-token';
      mocks.ClerkGoogleOneTapSignIn.presentExplicitSignIn.mockResolvedValue({
        type: 'success',
        data: { idToken: mockIdToken },
      });
      mocks.isSuccessResponse.mockReturnValue(true);

      // Mock signIn.create to throw external_account_not_found Clerk error
      const externalAccountError = {
        errors: [{ code: 'external_account_not_found' }],
        message: 'External account not found',
      };
      mockSignIn.create.mockRejectedValue(externalAccountError);

      // Mock isClerkAPIResponseError to return true for this error
      mocks.isClerkAPIResponseError.mockReturnValue(true);

      // Mock signUp.create to succeed with a new session
      const mockSignUpWithSession = {
        ...mockSignUp,
        create: vi.fn().mockResolvedValue(undefined),
        createdSessionId: 'new-signup-session-id',
      };
      mocks.useClerk.mockReturnValue({
        loaded: true,
        setActive: mockSetActive,
        client: {
          signIn: mockSignIn,
          signUp: mockSignUpWithSession,
        },
      });

      const { result } = renderHook(() => useSignInWithGoogle());

      const response = await result.current.startGoogleAuthenticationFlow({
        unsafeMetadata: { referral: 'google' },
      });

      // Verify signIn.create was called first
      expect(mockSignIn.create).toHaveBeenCalledWith({
        strategy: 'google_one_tap',
        token: mockIdToken,
      });

      // Verify signUp.create was called as fallback with the token
      expect(mockSignUpWithSession.create).toHaveBeenCalledWith({
        strategy: 'google_one_tap',
        token: mockIdToken,
        unsafeMetadata: { referral: 'google' },
      });

      // Verify the session was created
      expect(response.createdSessionId).toBe('new-signup-session-id');
      expect(response.setActive).toBe(mockSetActive);
    });
  });
});
