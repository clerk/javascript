import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useSignInWithGoogle } from '../useSignInWithGoogle.android';

const mocks = vi.hoisted(() => {
  return {
    useSignIn: vi.fn(),
    useSignUp: vi.fn(),
    GoogleSignin: {
      signIn: vi.fn(),
      hasPlayServices: vi.fn(),
      configure: vi.fn(),
    },
  };
});

vi.mock('@clerk/clerk-react', () => {
  return {
    useSignIn: mocks.useSignIn,
    useSignUp: mocks.useSignUp,
  };
});

vi.mock('@react-native-google-signin/google-signin', () => {
  return {
    GoogleSignin: mocks.GoogleSignin,
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
  };
});

vi.mock('expo-constants', () => {
  return {
    default: {
      expoConfig: {
        extra: {
          EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID: 'mock-web-client-id.apps.googleusercontent.com',
          EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID: 'mock-android-client-id.apps.googleusercontent.com',
        },
      },
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

    mocks.useSignIn.mockReturnValue({
      signIn: mockSignIn,
      setActive: mockSetActive,
      isLoaded: true,
    });

    mocks.useSignUp.mockReturnValue({
      signUp: mockSignUp,
      isLoaded: true,
    });

    mocks.GoogleSignin.hasPlayServices.mockResolvedValue(true);
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
      mocks.GoogleSignin.signIn.mockResolvedValue({
        data: {
          idToken: mockIdToken,
        },
      });

      mockSignIn.create.mockResolvedValue(undefined);
      mockSignIn.firstFactorVerification.status = 'verified';
      mockSignIn.createdSessionId = 'test-session-id';

      const { result } = renderHook(() => useSignInWithGoogle());

      const response = await result.current.startGoogleAuthenticationFlow();

      expect(mocks.GoogleSignin.hasPlayServices).toHaveBeenCalledWith({ showPlayServicesUpdateDialog: true });
      expect(mocks.GoogleSignin.signIn).toHaveBeenCalled();
      expect(mockSignIn.create).toHaveBeenCalledWith({
        strategy: 'google_one_tap',
        token: mockIdToken,
      });
      expect(response.createdSessionId).toBe('test-session-id');
      expect(response.setActive).toBe(mockSetActive);
    });

    test('should handle transfer flow for new user', async () => {
      const mockIdToken = 'mock-id-token';
      mocks.GoogleSignin.signIn.mockResolvedValue({
        data: {
          idToken: mockIdToken,
        },
      });

      mockSignIn.create.mockResolvedValue(undefined);
      mockSignIn.firstFactorVerification.status = 'transferable';

      const mockSignUpWithSession = { ...mockSignUp, createdSessionId: 'new-user-session-id' };
      mocks.useSignUp.mockReturnValue({
        signUp: mockSignUpWithSession,
        isLoaded: true,
      });

      const { result } = renderHook(() => useSignInWithGoogle());

      const response = await result.current.startGoogleAuthenticationFlow({
        unsafeMetadata: { source: 'test' },
      });

      expect(mockSignIn.create).toHaveBeenCalledWith({
        strategy: 'google_one_tap',
        token: mockIdToken,
      });
      expect(mockSignUp.create).toHaveBeenCalledWith({
        transfer: true,
        unsafeMetadata: { source: 'test' },
      });
      expect(response.createdSessionId).toBe('new-user-session-id');
    });

    test('should handle user cancellation gracefully', async () => {
      const cancelError = Object.assign(new Error('User canceled'), { code: 'SIGN_IN_CANCELLED' });
      mocks.GoogleSignin.signIn.mockRejectedValue(cancelError);

      const { result } = renderHook(() => useSignInWithGoogle());

      const response = await result.current.startGoogleAuthenticationFlow();

      expect(response.createdSessionId).toBe(null);
      expect(response.setActive).toBe(mockSetActive);
    });

    test('should handle user cancellation with numeric code', async () => {
      const cancelError = Object.assign(new Error('User canceled'), { code: '-5' });
      mocks.GoogleSignin.signIn.mockRejectedValue(cancelError);

      const { result } = renderHook(() => useSignInWithGoogle());

      const response = await result.current.startGoogleAuthenticationFlow();

      expect(response.createdSessionId).toBe(null);
      expect(response.setActive).toBe(mockSetActive);
    });

    test('should throw error when Play Services not available', async () => {
      const playServicesError = Object.assign(new Error('Play Services not available'), {
        code: 'PLAY_SERVICES_NOT_AVAILABLE',
      });
      mocks.GoogleSignin.hasPlayServices.mockRejectedValue(playServicesError);

      const { result } = renderHook(() => useSignInWithGoogle());

      await expect(result.current.startGoogleAuthenticationFlow()).rejects.toThrow(
        'Google Play Services is not available or outdated on this device.',
      );
    });

    test('should throw error when no ID token received', async () => {
      mocks.GoogleSignin.signIn.mockResolvedValue({
        data: {
          idToken: null,
        },
      });

      const { result } = renderHook(() => useSignInWithGoogle());

      await expect(result.current.startGoogleAuthenticationFlow()).rejects.toThrow(
        'No ID token received from Google Sign-In.',
      );
    });

    test('should throw error when response data is missing', async () => {
      mocks.GoogleSignin.signIn.mockResolvedValue({
        data: null,
      });

      const { result } = renderHook(() => useSignInWithGoogle());

      await expect(result.current.startGoogleAuthenticationFlow()).rejects.toThrow(
        'No ID token received from Google Sign-In.',
      );
    });

    test('should return early when clerk is not loaded', async () => {
      mocks.useSignIn.mockReturnValue({
        signIn: mockSignIn,
        setActive: mockSetActive,
        isLoaded: false,
      });

      const { result } = renderHook(() => useSignInWithGoogle());

      const response = await result.current.startGoogleAuthenticationFlow();

      expect(mocks.GoogleSignin.hasPlayServices).not.toHaveBeenCalled();
      expect(mocks.GoogleSignin.signIn).not.toHaveBeenCalled();
      expect(response.createdSessionId).toBe(null);
    });
  });
});
