import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  return {
    useClerk: vi.fn(),
    useUser: vi.fn(),
    isNativeSupported: true,
    ClerkExpoModule: {
      configure: vi.fn(),
      getSession: vi.fn(),
      getClientToken: vi.fn(),
      presentUserProfile: vi.fn(),
      signOut: vi.fn(),
    } as Record<string, any> | null,
    tokenCache: {
      getToken: vi.fn(),
      saveToken: vi.fn(),
    } as Record<string, any> | null,
  };
});

vi.mock('@clerk/react', () => ({
  useClerk: mocks.useClerk,
  useUser: mocks.useUser,
}));

vi.mock('../../utils/native-module', () => ({
  get isNativeSupported() {
    return mocks.isNativeSupported;
  },
  get ClerkExpoModule() {
    return mocks.ClerkExpoModule;
  },
}));

vi.mock('../../token-cache', () => ({
  get tokenCache() {
    return mocks.tokenCache;
  },
}));

// Import after mocks are wired up
import { useUserProfileModal } from '../useUserProfileModal';

const FAKE_PUB_KEY = 'pk_test_x';
const FAKE_BEARER_TOKEN = 'token_abc';
const NATIVE_SESSION = { sessionId: 'sess_native' };
const NATIVE_SESSION_ANDROID = { session: { id: 'sess_android' } };

let mockClerk: { publishableKey: string; signOut: ReturnType<typeof vi.fn> };
let mockUser: { id: string } | null;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isNativeSupported = true;
  mocks.ClerkExpoModule = {
    configure: vi.fn().mockResolvedValue(undefined),
    getSession: vi.fn().mockResolvedValue(null),
    getClientToken: vi.fn().mockResolvedValue(null),
    presentUserProfile: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
  mocks.tokenCache = {
    getToken: vi.fn().mockResolvedValue(null),
    saveToken: vi.fn().mockResolvedValue(undefined),
  };
  mockClerk = {
    publishableKey: FAKE_PUB_KEY,
    signOut: vi.fn().mockResolvedValue(undefined),
  };
  mockUser = { id: 'user_x' };
  mocks.useClerk.mockReturnValue(mockClerk);
  mocks.useUser.mockReturnValue({ user: mockUser });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useUserProfileModal', () => {
  describe('isAvailable', () => {
    test('returns false when native is unsupported', () => {
      mocks.isNativeSupported = false;
      const { result } = renderHook(() => useUserProfileModal());
      expect(result.current.isAvailable).toBe(false);
    });

    test('returns false when ClerkExpoModule is null', () => {
      mocks.ClerkExpoModule = null;
      const { result } = renderHook(() => useUserProfileModal());
      expect(result.current.isAvailable).toBe(false);
    });

    test('returns true when presentUserProfile is available', () => {
      const { result } = renderHook(() => useUserProfileModal());
      expect(result.current.isAvailable).toBe(true);
    });
  });

  describe('reentrancy guard', () => {
    test('skips when already presenting', async () => {
      // Make presentUserProfile hang so we can call again before it resolves
      let resolvePresent!: () => void;
      mocks.ClerkExpoModule!.presentUserProfile.mockImplementation(() => new Promise<void>(r => (resolvePresent = r)));

      const { result } = renderHook(() => useUserProfileModal());

      const first = result.current.presentUserProfile();
      // Wait for the first call to actually reach the (hung) presentUserProfile.
      await vi.waitFor(() => {
        expect(mocks.ClerkExpoModule!.presentUserProfile).toHaveBeenCalledTimes(1);
      });

      // Second call should be blocked by presentingRef and resolve immediately
      const second = result.current.presentUserProfile();
      await second;
      expect(mocks.ClerkExpoModule!.presentUserProfile).toHaveBeenCalledTimes(1);

      resolvePresent();
      await first;
    });

    test('skips when native is unsupported', async () => {
      mocks.isNativeSupported = false;
      const { result } = renderHook(() => useUserProfileModal());
      await act(async () => {
        await result.current.presentUserProfile();
      });
      expect(mocks.ClerkExpoModule!.presentUserProfile).not.toHaveBeenCalled();
    });
  });

  describe('pre-check happy path (native already has session)', () => {
    test('does NOT call configure or read token cache when native session exists (iOS shape)', async () => {
      mocks
        .ClerkExpoModule!.getSession.mockResolvedValueOnce(NATIVE_SESSION) // pre-check
        .mockResolvedValueOnce(NATIVE_SESSION); // post-modal check

      const { result } = renderHook(() => useUserProfileModal());
      await act(async () => {
        await result.current.presentUserProfile();
      });

      expect(mocks.tokenCache!.getToken).not.toHaveBeenCalled();
      expect(mocks.ClerkExpoModule!.configure).not.toHaveBeenCalled();
      expect(mocks.ClerkExpoModule!.presentUserProfile).toHaveBeenCalledTimes(1);
    });

    test('does NOT call configure when native session exists (Android shape)', async () => {
      mocks
        .ClerkExpoModule!.getSession.mockResolvedValueOnce(NATIVE_SESSION_ANDROID)
        .mockResolvedValueOnce(NATIVE_SESSION_ANDROID);

      const { result } = renderHook(() => useUserProfileModal());
      await act(async () => {
        await result.current.presentUserProfile();
      });

      expect(mocks.ClerkExpoModule!.configure).not.toHaveBeenCalled();
      expect(mocks.ClerkExpoModule!.presentUserProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('pre-sync path (JS-to-native bearer token)', () => {
    test('reads token cache, calls configure, and re-checks session when native has none', async () => {
      mocks
        .ClerkExpoModule!.getSession.mockResolvedValueOnce(null) // pre-check: no native session
        .mockResolvedValueOnce(NATIVE_SESSION) // post-configure: now has session
        .mockResolvedValueOnce(NATIVE_SESSION); // post-modal check
      mocks.tokenCache!.getToken.mockResolvedValueOnce(FAKE_BEARER_TOKEN);

      const { result } = renderHook(() => useUserProfileModal());
      await act(async () => {
        await result.current.presentUserProfile();
      });

      expect(mocks.tokenCache!.getToken).toHaveBeenCalledWith('__clerk_client_jwt');
      expect(mocks.ClerkExpoModule!.configure).toHaveBeenCalledWith(FAKE_PUB_KEY, FAKE_BEARER_TOKEN);
      expect(mocks.ClerkExpoModule!.getSession).toHaveBeenCalledTimes(3);
    });

    test('skips configure when token cache returns null', async () => {
      mocks
        .ClerkExpoModule!.getSession.mockResolvedValueOnce(null) // pre-check: no native session
        .mockResolvedValueOnce(null); // post-modal check: still no session
      mocks.tokenCache!.getToken.mockResolvedValueOnce(null);

      const { result } = renderHook(() => useUserProfileModal());
      await act(async () => {
        await result.current.presentUserProfile();
      });

      expect(mocks.ClerkExpoModule!.configure).not.toHaveBeenCalled();
      expect(mocks.ClerkExpoModule!.presentUserProfile).toHaveBeenCalledTimes(1);
      // hadNativeSessionBefore = false → no JS signOut
      expect(mockClerk.signOut).not.toHaveBeenCalled();
    });
  });

  describe('post-modal sign-out detection', () => {
    test('signs out JS SDK when native HAD a session and now is gone', async () => {
      mocks
        .ClerkExpoModule!.getSession.mockResolvedValueOnce(NATIVE_SESSION) // pre-check: had native session
        .mockResolvedValueOnce(null); // post-modal: now signed out

      const { result } = renderHook(() => useUserProfileModal());
      await act(async () => {
        await result.current.presentUserProfile();
      });

      expect(mocks.ClerkExpoModule!.signOut).toHaveBeenCalledTimes(1);
      expect(mockClerk.signOut).toHaveBeenCalledTimes(1);
    });

    test('does NOT sign out when native still has a session', async () => {
      mocks.ClerkExpoModule!.getSession.mockResolvedValueOnce(NATIVE_SESSION).mockResolvedValueOnce(NATIVE_SESSION);

      const { result } = renderHook(() => useUserProfileModal());
      await act(async () => {
        await result.current.presentUserProfile();
      });

      expect(mocks.ClerkExpoModule!.signOut).not.toHaveBeenCalled();
      expect(mockClerk.signOut).not.toHaveBeenCalled();
    });

    test('does NOT sign out when hadNativeSessionBefore was false (Get Help loop guard)', async () => {
      // Pre-check: no native session. Token cache empty. After modal: still no session.
      // This is the "Get Help loop" scenario — we must NOT sign out the JS SDK.
      mocks
        .ClerkExpoModule!.getSession.mockResolvedValueOnce(null) // pre-check
        .mockResolvedValueOnce(null); // post-modal
      mocks.tokenCache!.getToken.mockResolvedValueOnce(null);

      const { result } = renderHook(() => useUserProfileModal());
      await act(async () => {
        await result.current.presentUserProfile();
      });

      expect(mocks.ClerkExpoModule!.signOut).not.toHaveBeenCalled();
      expect(mockClerk.signOut).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    test('attempts JS signOut even if native signOut rejects', async () => {
      mocks.ClerkExpoModule!.getSession.mockResolvedValueOnce(NATIVE_SESSION).mockResolvedValueOnce(null);
      mocks.ClerkExpoModule!.signOut.mockRejectedValueOnce(new Error('native boom'));

      const { result } = renderHook(() => useUserProfileModal());
      await act(async () => {
        await result.current.presentUserProfile();
      });

      expect(mocks.ClerkExpoModule!.signOut).toHaveBeenCalledTimes(1);
      expect(mockClerk.signOut).toHaveBeenCalledTimes(1);
    });

    test('swallows JS signOut rejection', async () => {
      mocks.ClerkExpoModule!.getSession.mockResolvedValueOnce(NATIVE_SESSION).mockResolvedValueOnce(null);
      mockClerk.signOut.mockRejectedValueOnce(new Error('js boom'));

      const { result } = renderHook(() => useUserProfileModal());
      await act(async () => {
        // should NOT throw
        await result.current.presentUserProfile();
      });

      expect(mockClerk.signOut).toHaveBeenCalledTimes(1);
    });

    test('resets presentingRef in finally even on error', async () => {
      mocks
        .ClerkExpoModule!.presentUserProfile.mockRejectedValueOnce(new Error('present boom'))
        .mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useUserProfileModal());

      await act(async () => {
        await result.current.presentUserProfile();
      });
      // Second call should proceed (not blocked by stale ref)
      await act(async () => {
        await result.current.presentUserProfile();
      });

      expect(mocks.ClerkExpoModule!.presentUserProfile).toHaveBeenCalledTimes(2);
    });
  });
});
