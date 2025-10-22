import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useAppleSignIn } from '../useAppleSignIn';

const mocks = vi.hoisted(() => {
  return {
    useSignIn: vi.fn(),
    useSignUp: vi.fn(),
    signInAsync: vi.fn(),
    isAvailableAsync: vi.fn(),
    randomUUID: vi.fn(),
  };
});

vi.mock('@clerk/clerk-react', () => {
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

describe('useAppleSignIn', () => {
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

  describe('startAppleSignInFlow', () => {
    test('should return the hook with startAppleSignInFlow function', () => {
      const { result } = renderHook(() => useAppleSignIn());

      expect(result.current).toHaveProperty('startAppleSignInFlow');
      expect(typeof result.current.startAppleSignInFlow).toBe('function');
    });

    test('should successfully sign in existing user', async () => {
      const mockIdentityToken = 'mock-identity-token';
      mocks.signInAsync.mockResolvedValue({
        identityToken: mockIdentityToken,
      });

      mockSignIn.create.mockResolvedValue(undefined);
      mockSignIn.firstFactorVerification.status = 'verified';
      mockSignIn.createdSessionId = 'test-session-id';

      const { result } = renderHook(() => useAppleSignIn());

      const response = await result.current.startAppleSignInFlow();

      expect(mocks.isAvailableAsync).toHaveBeenCalled();
      expect(mocks.randomUUID).toHaveBeenCalled();
      expect(mocks.signInAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          requestedScopes: expect.any(Array),
          nonce: 'test-nonce-uuid',
        }),
      );
      expect(mockSignIn.create).toHaveBeenCalledWith({
        strategy: 'oauth_token_apple',
        token: mockIdentityToken,
      });
      expect(response.createdSessionId).toBe('test-session-id');
      expect(response.setActive).toBe(mockSetActive);
    });

    test('should handle transfer flow for new user', async () => {
      const mockIdentityToken = 'mock-identity-token';
      mocks.signInAsync.mockResolvedValue({
        identityToken: mockIdentityToken,
      });

      mockSignIn.create.mockResolvedValue(undefined);
      mockSignIn.firstFactorVerification.status = 'transferable';

      const mockSignUpWithSession = { ...mockSignUp, createdSessionId: 'new-user-session-id' };
      mocks.useSignUp.mockReturnValue({
        signUp: mockSignUpWithSession,
        isLoaded: true,
      });

      const { result } = renderHook(() => useAppleSignIn());

      const response = await result.current.startAppleSignInFlow({
        unsafeMetadata: { source: 'test' },
      });

      expect(mockSignIn.create).toHaveBeenCalledWith({
        strategy: 'oauth_token_apple',
        token: mockIdentityToken,
      });
      expect(mockSignUp.create).toHaveBeenCalledWith({
        transfer: true,
        unsafeMetadata: { source: 'test' },
      });
      expect(response.createdSessionId).toBe('new-user-session-id');
    });

    test('should handle user cancellation gracefully', async () => {
      const cancelError = Object.assign(new Error('User canceled'), { code: 'ERR_REQUEST_CANCELED' });
      mocks.signInAsync.mockRejectedValue(cancelError);

      const { result } = renderHook(() => useAppleSignIn());

      const response = await result.current.startAppleSignInFlow();

      expect(response.createdSessionId).toBe(null);
      expect(response.setActive).toBe(mockSetActive);
    });

    test('should throw error when Apple Authentication is not available', async () => {
      mocks.isAvailableAsync.mockResolvedValue(false);

      const { result } = renderHook(() => useAppleSignIn());

      await expect(result.current.startAppleSignInFlow()).rejects.toThrow(
        'Apple Authentication is not available on this device.',
      );
    });

    test('should throw error when no identity token received', async () => {
      mocks.signInAsync.mockResolvedValue({
        identityToken: null,
      });

      const { result } = renderHook(() => useAppleSignIn());

      await expect(result.current.startAppleSignInFlow()).rejects.toThrow(
        'No identity token received from Apple Sign-In.',
      );
    });

    test('should return early when clerk is not loaded', async () => {
      mocks.useSignIn.mockReturnValue({
        signIn: mockSignIn,
        setActive: mockSetActive,
        isLoaded: false,
      });

      const { result } = renderHook(() => useAppleSignIn());

      const response = await result.current.startAppleSignInFlow();

      expect(mocks.isAvailableAsync).not.toHaveBeenCalled();
      expect(mocks.signInAsync).not.toHaveBeenCalled();
      expect(response.createdSessionId).toBe(null);
    });
  });
});
