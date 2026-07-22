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

vi.mock('@clerk/react', () => {
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

vi.mock('../../specs/NativeClerkModule', () => {
  return {
    default: {
      configure: vi.fn(),
      getClientToken: vi.fn(),
      syncClientStateFromJs: vi.fn(),
    },
  };
});

vi.mock('../../specs/NativeClerkGoogleSignIn', () => {
  return {
    default: {
      configure: vi.fn(),
      signIn: vi.fn(),
      createAccount: vi.fn(),
      presentExplicitSignIn: vi.fn(),
      signOut: vi.fn(),
    },
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
  };

  const mockSignUp = {
    create: vi.fn(),
    createdSessionId: 'new-user-session-id',
    verifications: {
      externalAccount: {
        status: 'unverified',
      },
    },
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

    test('should sign up a new user and pass through their name', async () => {
      const mockIdToken = 'mock-id-token';
      mocks.ClerkGoogleOneTapSignIn.presentExplicitSignIn.mockResolvedValue({
        type: 'success',
        data: {
          idToken: mockIdToken,
          user: {
            id: 'google-user-id',
            email: 'jane@example.com',
            name: 'Jane Doe',
            givenName: 'Jane',
            familyName: 'Doe',
            photo: null,
          },
        },
      });
      mocks.isSuccessResponse.mockReturnValue(true);

      mockSignUp.create.mockResolvedValue(undefined);
      mockSignUp.verifications.externalAccount.status = 'unverified';
      mockSignUp.createdSessionId = 'new-user-session-id';

      const { result } = renderHook(() => useSignInWithGoogle());

      const response = await result.current.startGoogleAuthenticationFlow({
        unsafeMetadata: { source: 'test' },
      });

      expect(mocks.ClerkGoogleOneTapSignIn.configure).toHaveBeenCalledWith({
        webClientId: 'mock-web-client-id.apps.googleusercontent.com',
      });
      expect(mocks.ClerkGoogleOneTapSignIn.presentExplicitSignIn).toHaveBeenCalledWith({
        nonce: 'mock-uuid-nonce',
      });
      expect(mockSignUp.create).toHaveBeenCalledWith({
        strategy: 'google_one_tap',
        token: mockIdToken,
        firstName: 'Jane',
        lastName: 'Doe',
        unsafeMetadata: { source: 'test' },
      });
      expect(mockSignIn.create).not.toHaveBeenCalled();
      expect(response.createdSessionId).toBe('new-user-session-id');
      expect(response.setActive).toBe(mockSetActive);
    });

    test('should transfer to sign-in when the account already exists', async () => {
      const mockIdToken = 'mock-id-token';
      mocks.ClerkGoogleOneTapSignIn.presentExplicitSignIn.mockResolvedValue({
        type: 'success',
        data: {
          idToken: mockIdToken,
          user: {
            id: 'google-user-id',
            email: 'jane@example.com',
            name: 'Jane Doe',
            givenName: 'Jane',
            familyName: 'Doe',
            photo: null,
          },
        },
      });
      mocks.isSuccessResponse.mockReturnValue(true);

      mockSignUp.create.mockResolvedValue(undefined);
      mockSignUp.verifications.externalAccount.status = 'transferable';

      const mockSignInWithSession = { ...mockSignIn, createdSessionId: 'existing-user-session-id' };
      mocks.useClerk.mockReturnValue({
        loaded: true,
        setActive: mockSetActive,
        client: {
          signIn: mockSignInWithSession,
          signUp: mockSignUp,
        },
      });

      const { result } = renderHook(() => useSignInWithGoogle());

      const response = await result.current.startGoogleAuthenticationFlow({
        unsafeMetadata: { source: 'test' },
      });

      expect(mockSignUp.create).toHaveBeenCalledWith({
        strategy: 'google_one_tap',
        token: mockIdToken,
        firstName: 'Jane',
        lastName: 'Doe',
        unsafeMetadata: { source: 'test' },
      });
      expect(mockSignInWithSession.create).toHaveBeenCalledWith({
        transfer: true,
      });
      expect(response.createdSessionId).toBe('existing-user-session-id');
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

    test('should fall back to sign-in when external_account_exists error occurs', async () => {
      const mockIdToken = 'mock-id-token';
      mocks.ClerkGoogleOneTapSignIn.presentExplicitSignIn.mockResolvedValue({
        type: 'success',
        data: {
          idToken: mockIdToken,
          user: {
            id: 'google-user-id',
            email: 'jane@example.com',
            name: 'Jane Doe',
            givenName: 'Jane',
            familyName: 'Doe',
            photo: null,
          },
        },
      });
      mocks.isSuccessResponse.mockReturnValue(true);

      // Mock signUp.create to throw external_account_exists Clerk error
      const externalAccountError = {
        errors: [{ code: 'external_account_exists' }],
        message: 'External account exists',
      };
      mockSignUp.create.mockRejectedValue(externalAccountError);

      // Mock isClerkAPIResponseError to return true for this error
      mocks.isClerkAPIResponseError.mockReturnValue(true);

      // Mock signIn.create to succeed with a new session
      const mockSignInWithSession = {
        ...mockSignIn,
        create: vi.fn().mockResolvedValue(undefined),
        createdSessionId: 'existing-user-session-id',
      };
      mocks.useClerk.mockReturnValue({
        loaded: true,
        setActive: mockSetActive,
        client: {
          signIn: mockSignInWithSession,
          signUp: mockSignUp,
        },
      });

      const { result } = renderHook(() => useSignInWithGoogle());

      const response = await result.current.startGoogleAuthenticationFlow({
        unsafeMetadata: { referral: 'google' },
      });

      // Verify signUp.create was called first
      expect(mockSignUp.create).toHaveBeenCalledWith({
        strategy: 'google_one_tap',
        token: mockIdToken,
        firstName: 'Jane',
        lastName: 'Doe',
        unsafeMetadata: { referral: 'google' },
      });

      // Verify signIn.create was called as fallback with the token
      expect(mockSignInWithSession.create).toHaveBeenCalledWith({
        strategy: 'google_one_tap',
        token: mockIdToken,
      });

      // Verify the session was created
      expect(response.createdSessionId).toBe('existing-user-session-id');
      expect(response.setActive).toBe(mockSetActive);
    });
  });
});
