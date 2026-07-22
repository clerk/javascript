import { ClerkAPIResponseError } from '@clerk/shared/error';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useSignInWithApple } from '../useSignInWithApple.ios';

const mocks = vi.hoisted(() => {
  return {
    useSignIn: vi.fn(),
    useSignUp: vi.fn(),
    signInAsync: vi.fn(),
    isAvailableAsync: vi.fn(),
    randomUUID: vi.fn(),
  };
});

vi.mock('@clerk/react/legacy', () => {
  return {
    useSignIn: mocks.useSignIn,
    useSignUp: mocks.useSignUp,
  };
});

vi.mock('expo-apple-authentication', () => {
  return {
    signInAsync: mocks.signInAsync,
    isAvailableAsync: mocks.isAvailableAsync,
    AppleAuthenticationScope: {
      FULL_NAME: 0,
      EMAIL: 1,
    },
  };
});

vi.mock('expo-crypto', () => {
  return {
    default: {
      randomUUID: mocks.randomUUID,
    },
    randomUUID: mocks.randomUUID,
  };
});

vi.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
    },
  };
});

describe('useSignInWithApple', () => {
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

    mocks.useSignIn.mockReturnValue({
      signIn: mockSignIn,
      setActive: mockSetActive,
      isLoaded: true,
    });

    mocks.useSignUp.mockReturnValue({
      signUp: mockSignUp,
      isLoaded: true,
    });

    mocks.isAvailableAsync.mockResolvedValue(true);
    mocks.randomUUID.mockReturnValue('test-nonce-uuid');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('startAppleAuthenticationFlow', () => {
    test('should return the hook with startAppleAuthenticationFlow function', () => {
      const { result } = renderHook(() => useSignInWithApple());

      expect(result.current).toHaveProperty('startAppleAuthenticationFlow');
      expect(typeof result.current.startAppleAuthenticationFlow).toBe('function');
    });

    test('should sign up a new user and pass through their name', async () => {
      const mockIdentityToken = 'mock-identity-token';
      mocks.signInAsync.mockResolvedValue({
        identityToken: mockIdentityToken,
        fullName: {
          givenName: 'Jane',
          familyName: 'Appleseed',
        },
      });

      mockSignUp.create.mockResolvedValue(undefined);
      mockSignUp.verifications.externalAccount.status = 'unverified';
      mockSignUp.createdSessionId = 'new-user-session-id';

      const { result } = renderHook(() => useSignInWithApple());

      const response = await result.current.startAppleAuthenticationFlow({
        unsafeMetadata: { source: 'test' },
      });

      expect(mocks.isAvailableAsync).toHaveBeenCalled();
      expect(mocks.randomUUID).toHaveBeenCalled();
      expect(mocks.signInAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          requestedScopes: expect.any(Array),
          nonce: 'test-nonce-uuid',
        }),
      );
      expect(mockSignUp.create).toHaveBeenCalledWith({
        strategy: 'oauth_token_apple',
        token: mockIdentityToken,
        firstName: 'Jane',
        lastName: 'Appleseed',
        unsafeMetadata: { source: 'test' },
      });
      expect(mockSignIn.create).not.toHaveBeenCalled();
      expect(response.createdSessionId).toBe('new-user-session-id');
      expect(response.setActive).toBe(mockSetActive);
    });

    test('should transfer to sign-in when the account already exists', async () => {
      const mockIdentityToken = 'mock-identity-token';
      mocks.signInAsync.mockResolvedValue({
        identityToken: mockIdentityToken,
        fullName: {
          givenName: 'Jane',
          familyName: 'Appleseed',
        },
      });

      mockSignUp.create.mockResolvedValue(undefined);
      mockSignUp.verifications.externalAccount.status = 'transferable';

      const mockSignInWithSession = { ...mockSignIn, createdSessionId: 'existing-user-session-id' };
      mocks.useSignIn.mockReturnValue({
        signIn: mockSignInWithSession,
        setActive: mockSetActive,
        isLoaded: true,
      });

      const { result } = renderHook(() => useSignInWithApple());

      const response = await result.current.startAppleAuthenticationFlow();

      expect(mockSignUp.create).toHaveBeenCalledWith({
        strategy: 'oauth_token_apple',
        token: mockIdentityToken,
        firstName: 'Jane',
        lastName: 'Appleseed',
        unsafeMetadata: undefined,
      });
      expect(mockSignInWithSession.create).toHaveBeenCalledWith({
        transfer: true,
      });
      expect(response.createdSessionId).toBe('existing-user-session-id');
    });

    test('should handle a credential without a name (returning user)', async () => {
      const mockIdentityToken = 'mock-identity-token';
      mocks.signInAsync.mockResolvedValue({
        identityToken: mockIdentityToken,
        fullName: null,
      });

      mockSignUp.create.mockResolvedValue(undefined);
      mockSignUp.verifications.externalAccount.status = 'transferable';

      const mockSignInWithSession = { ...mockSignIn, createdSessionId: 'existing-user-session-id' };
      mocks.useSignIn.mockReturnValue({
        signIn: mockSignInWithSession,
        setActive: mockSetActive,
        isLoaded: true,
      });

      const { result } = renderHook(() => useSignInWithApple());

      const response = await result.current.startAppleAuthenticationFlow();

      expect(mockSignUp.create).toHaveBeenCalledWith({
        strategy: 'oauth_token_apple',
        token: mockIdentityToken,
        firstName: undefined,
        lastName: undefined,
        unsafeMetadata: undefined,
      });
      expect(response.createdSessionId).toBe('existing-user-session-id');
    });

    test('should fall back to sign-in when the instance restricts sign-ups', async () => {
      const mockIdentityToken = 'mock-identity-token';
      mocks.signInAsync.mockResolvedValue({
        identityToken: mockIdentityToken,
        fullName: null,
      });

      mockSignUp.create.mockRejectedValue(
        new ClerkAPIResponseError('Sign-ups restricted', {
          data: [{ code: 'sign_up_mode_restricted', message: 'Sign-ups restricted' }],
          status: 403,
        }),
      );

      const mockSignInWithSession = {
        ...mockSignIn,
        createdSessionId: 'existing-user-session-id',
        firstFactorVerification: { status: 'verified' },
      };
      mocks.useSignIn.mockReturnValue({
        signIn: mockSignInWithSession,
        setActive: mockSetActive,
        isLoaded: true,
      });

      const { result } = renderHook(() => useSignInWithApple());

      const response = await result.current.startAppleAuthenticationFlow();

      expect(mockSignInWithSession.create).toHaveBeenCalledWith({
        strategy: 'oauth_token_apple',
        token: mockIdentityToken,
      });
      expect(response.createdSessionId).toBe('existing-user-session-id');
      expect(response.setActive).toBe(mockSetActive);
    });

    test('should surface the restriction error for a new user when sign-ups are restricted', async () => {
      mocks.signInAsync.mockResolvedValue({
        identityToken: 'mock-identity-token',
        fullName: null,
      });

      mockSignUp.create.mockRejectedValue(
        new ClerkAPIResponseError('Sign-ups restricted', {
          data: [{ code: 'sign_up_mode_restricted', message: 'Sign-ups restricted' }],
          status: 403,
        }),
      );

      const mockSignInTransferable = {
        ...mockSignIn,
        createdSessionId: null,
        firstFactorVerification: { status: 'transferable' },
      };
      mocks.useSignIn.mockReturnValue({
        signIn: mockSignInTransferable,
        setActive: mockSetActive,
        isLoaded: true,
      });

      const { result } = renderHook(() => useSignInWithApple());

      await expect(result.current.startAppleAuthenticationFlow()).rejects.toThrow('Sign-ups restricted');
    });

    test('should rethrow sign-up errors that are not sign-up restrictions', async () => {
      mocks.signInAsync.mockResolvedValue({
        identityToken: 'mock-identity-token',
        fullName: null,
      });

      mockSignUp.create.mockRejectedValue(
        new ClerkAPIResponseError('Invalid token', {
          data: [{ code: 'oauth_token_invalid', message: 'Invalid token' }],
          status: 422,
        }),
      );

      const { result } = renderHook(() => useSignInWithApple());

      await expect(result.current.startAppleAuthenticationFlow()).rejects.toThrow('Invalid token');
      expect(mockSignIn.create).not.toHaveBeenCalled();
    });

    test('should handle user cancellation gracefully', async () => {
      const cancelError = Object.assign(new Error('User canceled'), { code: 'ERR_REQUEST_CANCELED' });
      mocks.signInAsync.mockRejectedValue(cancelError);

      const { result } = renderHook(() => useSignInWithApple());

      const response = await result.current.startAppleAuthenticationFlow();

      expect(response.createdSessionId).toBe(null);
      expect(response.setActive).toBe(mockSetActive);
    });

    test('should throw error when Apple Authentication is not available', async () => {
      mocks.isAvailableAsync.mockResolvedValue(false);

      const { result } = renderHook(() => useSignInWithApple());

      await expect(result.current.startAppleAuthenticationFlow()).rejects.toThrow(
        'Apple Authentication is not available on this device.',
      );
    });

    test('should throw error when no identity token received', async () => {
      mocks.signInAsync.mockResolvedValue({
        identityToken: null,
      });

      const { result } = renderHook(() => useSignInWithApple());

      await expect(result.current.startAppleAuthenticationFlow()).rejects.toThrow(
        'No identity token received from Apple Sign-In.',
      );
    });

    test('should return early when clerk is not loaded', async () => {
      mocks.useSignIn.mockReturnValue({
        signIn: mockSignIn,
        setActive: mockSetActive,
        isLoaded: false,
      });

      const { result } = renderHook(() => useSignInWithApple());

      const response = await result.current.startAppleAuthenticationFlow();

      expect(mocks.isAvailableAsync).not.toHaveBeenCalled();
      expect(mocks.signInAsync).not.toHaveBeenCalled();
      expect(response.createdSessionId).toBe(null);
    });
  });
});
